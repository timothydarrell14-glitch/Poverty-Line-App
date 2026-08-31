from functools import wraps

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models.organisations import Organisation
from app.models.programs import Program
from app.models.users import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def serialize_user(user):
    return {
        "id": user.user_id,
        "name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "role": user.role,
        "status": "Active" if user.is_active else "Inactive",
        "lastActive": user.created_at.strftime("%b %d, %Y") if user.created_at else "Never",
    }


def serialize_program(program):
    return {
        "id": program.program_id,
        "title": program.name,
        "description": program.description or "No description provided.",
        "status": program.status or "Draft",
        "statusType": (program.status or "draft").lower().replace(" ", "-"),
        "location": program.location,
        "organisation_id": program.organisation_id,
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
    if not user or not user.is_active or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password."}), 401
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

    return jsonify(
        {
            "user": {
                "id": user.user_id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "role": user.role,
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
        return jsonify({"message": "First name, last name, and email are required."}), 400

    email_owner = User.query.filter(User.email == email, User.user_id != user.user_id).first()
    if email_owner:
        return jsonify({"message": "That email address is already in use."}), 409

    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    db.session.commit()

    return jsonify(
        {
            "user": {
                "id": user.user_id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "role": user.role,
            }
        }
    )


@auth_bp.get("/organisations")
@admin_required
def list_organisations():
    return jsonify({"organisations": [{"id": org.organisation_id, "name": org.name, "type": org.organisation_type, "location": org.location} for org in Organisation.query.order_by(Organisation.organisation_id.desc()).all()]})


@auth_bp.post("/organisations")
@admin_required
def create_organisation():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    organisation_type = str(data.get("organisation_type", "")).strip() or "Nonprofit"
    if not name:
        return jsonify({"message": "Organisation name is required."}), 400

    organisation = Organisation(name=name, organisation_type=organisation_type, description=data.get("description"), location=data.get("location"), verified=bool(data.get("verified", False)))
    db.session.add(organisation)
    db.session.commit()
    return jsonify({"organisation": {"id": organisation.organisation_id, "name": organisation.name, "type": organisation.organisation_type}}), 201


@auth_bp.get("/users")
@admin_required
def list_users():
    return jsonify({"users": [serialize_user(user) for user in User.query.order_by(User.created_at.desc()).all()]})


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
    db.session.commit()
    return jsonify({"user": serialize_user(user)}), 201


@auth_bp.patch("/users/<int:user_id>")
@admin_required
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    data = request.get_json(silent=True) or {}
    if "role" in data:
        user.role = data["role"]
    if "is_active" in data:
        user.is_active = bool(data["is_active"])
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
    return jsonify({"programs": [serialize_program(program) for program in Program.query.order_by(Program.program_id.desc()).all()]})


@auth_bp.post("/programs")
@admin_required
def create_program():
    data = request.get_json(silent=True) or {}
    required = ["name", "organisation_id"]
    if not all(str(data.get(key, "")).strip() for key in required):
        return jsonify({"message": "Program name and organisation are required."}), 400

    organisation = db.session.get(Organisation, int(data["organisation_id"]))
    if organisation is None:
        return jsonify({"message": "Organisation not found."}), 404

    program = Program(
        organisation_id=organisation.organisation_id,
        name=str(data["name"]).strip(),
        description=data.get("description"),
        category=data.get("category"),
        location=data.get("location"),
        eligibility=data.get("eligibility"),
        status=data.get("status") or "Draft",
    )
    db.session.add(program)
    db.session.commit()
    return jsonify({"program": serialize_program(program)}), 201


@auth_bp.patch("/programs/<int:program_id>")
@admin_required
def update_program(program_id):
    program = db.session.get(Program, program_id)
    if not program:
        return jsonify({"message": "Program not found."}), 404
    data = request.get_json(silent=True) or {}
    if "status" in data:
        program.status = data["status"]
    if "name" in data:
        program.name = data["name"]
    if "description" in data:
        program.description = data["description"]
    if "location" in data:
        program.location = data["location"]
    db.session.commit()
    return jsonify({"program": serialize_program(program)})


@auth_bp.get("/chats")
@admin_required
def list_chats():
    from app.models.chats import Chat

    chats = Chat.query.order_by(Chat.updated_at.desc()).all()
    return jsonify({"chats": [{"id": chat.chat_id, "name": chat.contact_name, "role": chat.role, "lastMessage": chat.last_message, "status": chat.status, "unread": chat.unread_count, "time": chat.updated_at.strftime("%b %d, %Y") if chat.updated_at else "Just now"} for chat in chats]})


@auth_bp.post("/chats")
@admin_required
def create_chat():
    from app.models.chats import Chat

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
    return jsonify({"chat": {"id": chat.chat_id, "name": chat.contact_name, "role": chat.role, "lastMessage": chat.last_message, "status": chat.status, "unread": chat.unread_count}}), 201


@auth_bp.get("/deliveries")
@admin_required
def list_deliveries():
    from app.models.deliveries import Delivery

    deliveries = Delivery.query.order_by(Delivery.updated_at.desc()).all()
    return jsonify({"deliveries": [{"id": delivery.reference_code, "destination": delivery.destination, "status": delivery.status, "updated": delivery.last_update, "marker": delivery.marker_class} for delivery in deliveries]})


@auth_bp.post("/deliveries")
@admin_required
def create_delivery():
    from app.models.deliveries import Delivery

    data = request.get_json(silent=True) or {}
    reference = str(data.get("reference_code") or data.get("id") or "").strip()
    destination = str(data.get("destination", "")).strip()
    if not reference or not destination:
        return jsonify({"message": "Delivery reference and destination are required."}), 400

    delivery = Delivery(
        reference_code=reference,
        destination=destination,
        status=data.get("status") or "In Transit",
        last_update=data.get("last_update") or "Updated: Just now",
        marker_class=data.get("marker_class") or "delivery-map__marker--new",
    )
    db.session.add(delivery)
    db.session.commit()
    return jsonify({"delivery": {"id": delivery.reference_code, "destination": delivery.destination, "status": delivery.status, "updated": delivery.last_update, "marker": delivery.marker_class}}), 201


@auth_bp.get("/settings")
@admin_required
def list_settings():
    from app.models.settings import AppSetting

    settings = AppSetting.query.order_by(AppSetting.key).all()
    return jsonify({"settings": [{"key": option.key, "value": option.value, "category": option.category} for option in settings]})


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
        setting = AppSetting(key=key, value=data.get("value"), category=data.get("category") or "general")
        db.session.add(setting)
    else:
        setting.value = data.get("value")
        setting.category = data.get("category") or setting.category
    db.session.commit()
    return jsonify({"setting": {"key": setting.key, "value": setting.value, "category": setting.category}}), 201
