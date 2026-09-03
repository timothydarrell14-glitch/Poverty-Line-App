import os
from datetime import datetime, timezone
from functools import wraps
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.users.organisations import Organisation
from app.models.programs import Program
from app.models.users.users import USER_STATUSES, User
from app.models.users.members import Member
from app.services.notifications import notify


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def save_uploaded_image(file_storage, subfolder):
    """Persist an uploaded image under static/uploads and return its public URL."""
    filename = secure_filename(file_storage.filename or "")
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        return None
    unique_name = f"{uuid4().hex}.{extension}"
    upload_dir = os.path.join(current_app.static_folder, "uploads", subfolder)
    os.makedirs(upload_dir, exist_ok=True)
    file_storage.save(os.path.join(upload_dir, unique_name))
    return f"/static/uploads/{subfolder}/{unique_name}"


def serialize_user(user):
    last_active = user.last_active_at or user.created_at
    return {
        "id": user.user_id,
        "name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "avatarUrl": user.avatar_url,
        "lastActive": last_active.strftime("%b %d, %Y %H:%M") if last_active else "Never",
    }


def serialize_program(program):
    completed_amount = sum(
        donation.amount
        for donation in program.financial_donations
        if donation.payment_status == "completed"
    )
    return {
        "id": program.id,
        "title": program.title,
        "summary": program.summary,
        "description": program.description or "No description provided.",
        "long_description": program.long_description,
        "image_url": program.image_url,
        "type": program.type,
        "active": program.active,
        "location": program.location,
        "organisation_id": program.organisation_id,
        "organisation_name": program.organisation.name if program.organisation else None,
        "program_kind": program.program_kind,
        "funding_goal": float(program.funding_goal or 0),
        "funding_raised": float(completed_amount),
        "progress_target": program.progress_target,
        "progress_value": program.progress_value,
        "progress_unit": program.progress_unit,
    }


def current_user_from_token():
    identity = get_jwt_identity()
    if identity is None:
        return None
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None
    return db.session.get(User, user_id)


def admin_user():
    user = current_user_from_token()
    return user if user and user.role.lower() == "admin" else None


def admin_required(view):
    @wraps(view)
    @jwt_required()
    def wrapped(*args, **kwargs):
        user = admin_user()
        if user is None:
            return jsonify({"message": "Admin access required."}), 403
        return view(*args, **kwargs)

    return wrapped


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    user = User.query.filter_by(email=email).first()
    if (
        not user
        or not user.is_active
        or not check_password_hash(user.password_hash, password)
    ):
        return jsonify({"message": "Invalid email or password."}), 401
    user.last_active_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(
        {
            "access_token": create_access_token(identity=str(user.user_id)),
            "user": serialize_user(user),
        }
    )


@auth_bp.post("/logout")
@jwt_required()
def logout():
    return jsonify({"message": "Logged out successfully."})


@auth_bp.get("/me")
@jwt_required()
def current_user():
    """Return the authenticated user's access data from the database."""
    user = current_user_from_token()

    if user is None:
        return jsonify({"message": "User not found."}), 404

    user.last_active_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(
        {
            "user": {
                "id": user.user_id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "role": user.role,
                "avatarUrl": user.avatar_url,
                "coverUrl": user.cover_url,
            }
        }
    )


@auth_bp.patch("/me")
@jwt_required()
def update_current_user():
    """Update the authenticated administrator's editable profile details."""
    user = current_user_from_token()
    if user is None:
        return jsonify({"message": "User not found."}), 404

    payload = request.get_json(silent=True) or {}
    first_name = str(payload.get("first_name", "")).strip()
    last_name = str(payload.get("last_name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()

    if not all((first_name, last_name, email)):
        return jsonify(
            {"message": "First name, last name, and email are required."}
        ), 400

    email_owner = User.query.filter(
        User.email == email, User.user_id != user.user_id
    ).first()
    if email_owner:
        return jsonify({"message": "That email address is already in use."}), 409

    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    if "avatar_url" in payload:
        user.avatar_url = str(payload.get("avatar_url") or "").strip() or None
    if "cover_url" in payload:
        user.cover_url = str(payload.get("cover_url") or "").strip() or None
    db.session.commit()

    return jsonify(
        {
            "user": {
                "id": user.user_id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "role": user.role,
                "avatarUrl": user.avatar_url,
                "coverUrl": user.cover_url,
            }
        }
    )


@auth_bp.post("/me/avatar")
@jwt_required()
def upload_avatar():
    """Upload a new profile picture for the authenticated administrator."""
    user = current_user_from_token()
    if user is None:
        return jsonify({"message": "User not found."}), 404
    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"message": "An image file is required."}), 400
    url = save_uploaded_image(file, "avatars")
    if url is None:
        return jsonify({"message": "Unsupported image type."}), 422
    user.avatar_url = url
    db.session.commit()
    return jsonify({"avatarUrl": user.avatar_url})


@auth_bp.post("/me/cover")
@jwt_required()
def upload_cover():
    """Upload a new dashboard cover image for the authenticated administrator."""
    user = current_user_from_token()
    if user is None:
        return jsonify({"message": "User not found."}), 404
    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"message": "An image file is required."}), 400
    url = save_uploaded_image(file, "covers")
    if url is None:
        return jsonify({"message": "Unsupported image type."}), 422
    user.cover_url = url
    db.session.commit()
    return jsonify({"coverUrl": user.cover_url})


@auth_bp.get("/notifications")
@admin_required
def list_notifications():
    from app.models.notifications import Notification

    notifications = Notification.query.order_by(Notification.created_at.desc()).limit(50).all()
    return jsonify(
        {
            "notifications": [
                {
                    "id": item.notification_id,
                    "type": item.type,
                    "title": item.title,
                    "message": item.message,
                    "isRead": item.is_read,
                    "createdAt": item.created_at.isoformat() if item.created_at else None,
                }
                for item in notifications
            ],
            "unreadCount": Notification.query.filter_by(is_read=False).count(),
        }
    )


@auth_bp.post("/notifications/<int:notification_id>/read")
@admin_required
def mark_notification_read(notification_id):
    from app.models.notifications import Notification

    notification = db.session.get(Notification, notification_id)
    if notification is None:
        return jsonify({"message": "Notification not found."}), 404
    notification.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read."})


@auth_bp.post("/notifications/read-all")
@admin_required
def mark_all_notifications_read():
    from app.models.notifications import Notification

    Notification.query.filter_by(is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read."})


@auth_bp.get("/settings/public")
def public_settings():
    from app.models.settings import AppSetting

    defaults = {
        "orgName": "Poverty Line Initiative",
        "supportEmail": "support@povertyline.org",
        "publicDescription": "# Dignity Through Efficiency",
    }
    settings = AppSetting.query.filter(
        AppSetting.key.in_(defaults.keys()), AppSetting.category == "general"
    ).all()
    values = {setting.key: setting.value for setting in settings if setting.value}
    return jsonify({"settings": {**defaults, **values}})


@auth_bp.get("/dashboard-stats")
@admin_required
def dashboard_stats():
    from app.models.donations.financialDonations import FinancialDonation

    active_programs = Program.query.filter_by(active=True).count()
    total_donations = db.session.query(
        db.func.coalesce(db.func.sum(FinancialDonation.amount), 0)
    ).filter(FinancialDonation.payment_status == "completed").scalar()
    donations_count = FinancialDonation.query.filter_by(payment_status="completed").count()
    partnerships = Organisation.query.count()
    return jsonify(
        {
            "activePrograms": active_programs,
            "totalDonations": float(total_donations or 0),
            "donationsCount": donations_count,
            "partnerships": partnerships,
        }
    )


@auth_bp.get("/organisations")
@admin_required
def list_organisations():
    return jsonify(
        {
            "organisations": [
                {
                    "id": org.organisation_id,
                    "name": org.name,
                    "type": org.organisation_type,
                    "location": org.location,
                }
                for org in Organisation.query.order_by(
                    Organisation.organisation_id.desc()
                ).all()
            ]
        }
    )


@auth_bp.post("/organisations")
@admin_required
def create_organisation():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    organisation_type = str(data.get("organisation_type", "")).strip() or "Nonprofit"
    if not name:
        return jsonify({"message": "Organisation name is required."}), 400

    organisation = Organisation(
        owner_user_id=admin_user().user_id,
        name=name,
        organisation_type=organisation_type,
        description=data.get("description"),
        location=data.get("location"),
        verified=bool(data.get("verified", False)),
    )
    db.session.add(organisation)
    db.session.flush()
    notify(
        "new_partner",
        "New partner onboarded",
        f"{organisation.name} has joined as a partner organisation.",
        related_type="organisation",
        related_id=organisation.organisation_id,
    )
    db.session.commit()
    return jsonify(
        {
            "organisation": {
                "id": organisation.organisation_id,
                "name": organisation.name,
                "type": organisation.organisation_type,
            }
        }
    ), 201


@auth_bp.get("/organisations/<int:organisation_id>")
@admin_required
def get_organisation(organisation_id):
    organisation = db.session.get(Organisation, organisation_id)
    if organisation is None:
        return jsonify({"message": "Organisation not found."}), 404
    return jsonify(
        {
            "organisation": {
                "id": organisation.organisation_id,
                "name": organisation.name,
                "type": organisation.organisation_type,
                "location": organisation.location,
            }
        }
    )


@auth_bp.patch("/organisations/<int:organisation_id>")
@admin_required
def update_organisation(organisation_id):
    organisation = db.session.get(Organisation, organisation_id)
    if organisation is None:
        return jsonify({"message": "Organisation not found."}), 404
    data = request.get_json(silent=True) or {}
    for field in ("name", "organisation_type", "description", "location", "verified"):
        if field in data:
            setattr(organisation, field, data[field])
    db.session.commit()
    return jsonify(
        {
            "organisation": {
                "id": organisation.organisation_id,
                "name": organisation.name,
            }
        }
    )


@auth_bp.delete("/organisations/<int:organisation_id>")
@admin_required
def delete_organisation(organisation_id):
    organisation = db.session.get(Organisation, organisation_id)
    if organisation is None:
        return jsonify({"message": "Organisation not found."}), 404
    db.session.delete(organisation)
    db.session.commit()
    return "", 204


@auth_bp.get("/users")
@admin_required
def list_users():
    return jsonify(
        {
            "users": [
                serialize_user(user)
                for user in User.query.filter(User.role != "member")
                .order_by(User.created_at.desc())
                .all()
            ]
        }
    )


@auth_bp.get("/members")
@admin_required
def list_members():
    members = User.query.filter_by(role="member").order_by(User.created_at.desc()).all()
    return jsonify(
        {
            "members": [
                {
                    "id": member.user_id,
                    "name": f"{member.first_name} {member.last_name}",
                    "email": member.email,
                    "phone": member.phone,
                    "location": member.member.location if member.member else None,
                    "status": member.status,
                    "povertyClassification": member.member.poverty_classification if member.member else None,
                    "joined": member.created_at.strftime("%b %d, %Y")
                    if member.created_at
                    else "Unknown",
                }
                for member in members
            ]
        }
    )


@auth_bp.get("/donations")
@admin_required
def list_donations():
    from app.models.donations.financialDonations import FinancialDonation

    donations = FinancialDonation.query.order_by(
        FinancialDonation.donation_id.desc()
    ).all()
    return jsonify(
        {
            "donations": [
                {
                    "id": donation.donation_id,
                    "donorName": donation.donor.name if donation.donor else "Anonymous",
                    "donorEmail": donation.donor.email if donation.donor else None,
                    "programTitle": donation.program.title if donation.program else "General Community Fund",
                    "amount": float(donation.amount),
                    "currency": donation.currency,
                    "paymentMethod": donation.payment_method,
                    "status": donation.payment_status,
                    "date": donation.donation_date.strftime("%b %d, %Y")
                    if donation.donation_date
                    else "Unknown",
                }
                for donation in donations
            ]
        }
    )


@auth_bp.get("/donations/non-financial")
@admin_required
def list_non_financial_donations():
    from app.models.donations.nonFInancialDonations import NonFinancialDonation

    donations = NonFinancialDonation.query.order_by(NonFinancialDonation.id.desc()).all()
    return jsonify(
        {
            "donations": [
                {
                    "id": donation.id,
                    "donorName": donation.donor.name if donation.donor else "Anonymous",
                    "donorEmail": donation.donor.email if donation.donor else None,
                    "programTitle": donation.program.title if donation.program else "General Community Fund",
                    "type": donation.type,
                    "description": donation.description,
                    "date": donation.donation_date.strftime("%b %d, %Y")
                    if donation.donation_date
                    else "Unknown",
                }
                for donation in donations
            ]
        }
    )


@auth_bp.get("/donors")
@admin_required
def list_donors():
    from app.models.users.donors import Donor

    donors = Donor.query.order_by(Donor.id.desc()).all()
    return jsonify(
        {
            "donors": [
                {
                    "id": donor.id,
                    "name": donor.name,
                    "email": donor.email,
                    "phone": donor.phone_number,
                    "totalDonated": float(
                        sum(
                            donation.amount
                            for donation in donor.financial_donations
                            if donation.payment_status == "completed"
                        )
                    ),
                    "donationCount": sum(
                        1
                        for donation in donor.financial_donations
                        if donation.payment_status == "completed"
                    ),
                }
                for donor in donors
            ]
        }
    )


@auth_bp.post("/users")
@admin_required
def create_user():
    data = request.get_json(silent=True) or {}
    required = ["first_name", "last_name", "email", "role", "password"]
    if not all(str(data.get(key, "")).strip() for key in required):
        return jsonify({"message": "All user fields are required."}), 400
    if User.query.filter_by(email=data["email"].strip().lower()).first():
        return jsonify({"message": "That email address is already in use."}), 409
    user = User(
        first_name=data["first_name"].strip(),
        last_name=data["last_name"].strip(),
        email=data["email"].strip().lower(),
        role=data["role"].strip(),
        password_hash=generate_password_hash(data["password"]),
        is_active=True,
    )
    db.session.add(user)
    db.session.flush()
    profile = user.sync_role_profile()
    if profile is not None:
        db.session.add(profile)
    db.session.commit()
    return jsonify({"user": serialize_user(user)}), 201


@auth_bp.get("/users/<int:user_id>")
@admin_required
def get_user(user_id):
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404
    return jsonify({"user": serialize_user(user)})


@auth_bp.patch("/users/<int:user_id>")
@admin_required
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    data = request.get_json(silent=True) or {}
    if "role" in data:
        role = str(data["role"]).strip().lower()
        if role not in ("member", "donor", "admin", "partner"):
            return jsonify({"message": "Role must be member, donor, admin, or partner."}), 422
        user.role = role
    if "status" in data:
        status = str(data["status"]).strip()
        if status not in USER_STATUSES:
            return jsonify(
                {"message": f"Status must be one of: {', '.join(USER_STATUSES)}."}
            ), 400
        user.status = status
        user.is_active = status in ("Active", "On Leave")
    if "is_active" in data:
        user.is_active = bool(data["is_active"])
        user.status = "Active" if user.is_active else "Inactive"
    profile = user.sync_role_profile()
    if profile is not None:
        db.session.add(profile)
    db.session.commit()
    return jsonify({"user": serialize_user(user)})


@auth_bp.delete("/users/<int:user_id>")
@admin_required
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    admin = admin_user()
    if user.user_id == admin.user_id:
        return jsonify({"message": "You cannot delete your own account."}), 400
    db.session.delete(user)
    db.session.commit()
    return "", 204


@auth_bp.get("/programs")
@admin_required
def list_programs():
    return jsonify(
        {
            "programs": [
                serialize_program(program)
                for program in Program.query.order_by(Program.id.desc()).all()
            ]
        }
    )


@auth_bp.post("/programs")
@admin_required
def create_program():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title") or data.get("name") or "").strip()
    if not title or not str(data.get("organisation_id", "")).strip():
        return jsonify({"message": "Program title and organisation are required."}), 400

    organisation = db.session.get(Organisation, int(data["organisation_id"]))
    if organisation is None:
        return jsonify({"message": "Organisation not found."}), 404

    program_kind = data.get("program_kind") or "financial"
    program = Program(
        organisation_id=organisation.organisation_id,
        title=title,
        description=data.get("description"),
        summary=data.get("summary"),
        long_description=data.get("long_description"),
        image_url=data.get("image_url"),
        type=data.get("type") or data.get("category"),
        location=data.get("location"),
        created_by=admin_user().user_id,
        active=data.get("active", str(data.get("status", "active")).lower() == "active"),
        program_kind=program_kind,
        funding_goal=data.get("funding_goal") or None,
        progress_target=data.get("progress_target") or None,
        progress_value=data.get("progress_value") or 0,
        progress_unit=data.get("progress_unit"),
    )
    db.session.add(program)
    db.session.commit()
    return jsonify({"program": serialize_program(program)}), 201


@auth_bp.get("/programs/<int:program_id>")
@admin_required
def get_program(program_id):
    program = db.session.get(Program, program_id)
    if program is None:
        return jsonify({"message": "Program not found."}), 404
    return jsonify({"program": serialize_program(program)})


@auth_bp.patch("/programs/<int:program_id>")
@admin_required
def update_program(program_id):
    from app.services.program_milestones import check_funding_milestones

    program = db.session.get(Program, program_id)
    if not program:
        return jsonify({"message": "Program not found."}), 404
    data = request.get_json(silent=True) or {}
    was_active = program.active
    for key in (
        "title",
        "description",
        "summary",
        "long_description",
        "image_url",
        "type",
        "location",
        "active",
        "program_kind",
        "organisation_id",
        "funding_goal",
        "progress_target",
        "progress_value",
        "progress_unit",
    ):
        if key in data:
            setattr(program, key, data[key])
    if was_active and "active" in data and not program.active:
        notify(
            "program_completed",
            "Program completed",
            f"{program.title} has been marked as completed.",
            related_type="program",
            related_id=program.id,
        )
    if "funding_goal" in data:
        check_funding_milestones(program)
    db.session.commit()
    return jsonify({"program": serialize_program(program)})


@auth_bp.delete("/programs/<int:program_id>")
@admin_required
def delete_program(program_id):
    program = db.session.get(Program, program_id)
    if program is None:
        return jsonify({"message": "Program not found."}), 404
    db.session.delete(program)
    db.session.commit()
    return "", 204


@auth_bp.get("/chats")
@admin_required
def list_chats():
    from app.models.communication.chats import Chat

    chats = Chat.query.order_by(Chat.updated_at.desc()).all()
    return jsonify(
        {
            "chats": [
                {
                    "id": chat.chat_id,
                    "name": chat.contact_name,
                    "role": chat.role,
                    "lastMessage": chat.last_message,
                    "status": chat.status,
                    "unread": chat.unread_count,
                    "time": chat.updated_at.strftime("%b %d, %Y")
                    if chat.updated_at
                    else "Just now",
                }
                for chat in chats
            ]
        }
    )


@auth_bp.post("/chats")
@admin_required
def create_chat():
    from app.models.communication.chats import Chat

    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    if not name:
        return jsonify({"message": "Chat name is required."}), 400

    chat = Chat(
        contact_name=name,
        role=data.get("role") or "Partner",
        last_message=data.get("last_message") or "New conversation started.",
        status=data.get("status") or "Active now",
        unread_count=int(data.get("unread_count") or 0),
    )
    db.session.add(chat)
    db.session.commit()
    return jsonify(
        {
            "chat": {
                "id": chat.chat_id,
                "name": chat.contact_name,
                "role": chat.role,
                "lastMessage": chat.last_message,
                "status": chat.status,
                "unread": chat.unread_count,
            }
        }
    ), 201


@auth_bp.get("/deliveries")
@admin_required
def list_deliveries():
    from app.models.donations.deliveries import Delivery

    deliveries = Delivery.query.order_by(Delivery.updated_at.desc()).all()
    return jsonify(
        {
            "deliveries": [
                {
                    "id": delivery.reference_code,
                    "destination": delivery.destination,
                    "status": delivery.status,
                    "updated": delivery.last_update,
                    "marker": delivery.marker_class,
                }
                for delivery in deliveries
            ]
        }
    )


@auth_bp.post("/deliveries")
@admin_required
def create_delivery():
    from app.models.donations.deliveries import Delivery

    data = request.get_json(silent=True) or {}
    reference = str(data.get("reference_code") or data.get("id") or "").strip()
    destination = str(data.get("destination", "")).strip()
    if not reference or not destination:
        return jsonify(
            {"message": "Delivery reference and destination are required."}
        ), 400

    delivery = Delivery(
        reference_code=reference,
        destination=destination,
        status=data.get("status") or "In Transit",
        last_update=data.get("last_update") or "Updated: Just now",
        marker_class=data.get("marker_class") or "delivery-map__marker--new",
    )
    db.session.add(delivery)
    db.session.commit()
    return jsonify(
        {
            "delivery": {
                "id": delivery.reference_code,
                "destination": delivery.destination,
                "status": delivery.status,
                "updated": delivery.last_update,
                "marker": delivery.marker_class,
            }
        }
    ), 201


@auth_bp.get("/settings")
@admin_required
def list_settings():
    from app.models.settings import AppSetting

    settings = AppSetting.query.order_by(AppSetting.key).all()
    return jsonify(
        {
            "settings": [
                {"key": option.key, "value": option.value, "category": option.category}
                for option in settings
            ]
        }
    )


@auth_bp.post("/settings")
@admin_required
def create_or_update_setting():
    from app.models.settings import AppSetting

    data = request.get_json(silent=True) or {}
    key = str(data.get("key", "")).strip()
    if not key:
        return jsonify({"message": "Setting key is required."}), 400
    setting = AppSetting.query.filter_by(key=key).first()
    if setting is None:
        setting = AppSetting(
            key=key, value=data.get("value"), category=data.get("category") or "general"
        )
        db.session.add(setting)
    else:
        setting.value = data.get("value")
        setting.category = data.get("category") or setting.category
    db.session.commit()
    return jsonify(
        {
            "setting": {
                "key": setting.key,
                "value": setting.value,
                "category": setting.category,
            }
        }
    ), 201
