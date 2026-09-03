from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.users.users import User
from app.routes.authorization import admin_required, get_authenticated_user
from app.schemas.users.user_schema import (
    user_schema,
    users_schema,
    user_register_schema,
    user_update_schema,
    admin_user_update_schema,
)
from app.services.notifications import notify


users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("/register", methods=["POST"])
def register():
    try:
        data = user_register_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    if User.get_by_email(data["email"]):
        return jsonify({"error": "Email already registered"}), 409

    user = User.create_from_registration(data)
    db.session.add(user)
    db.session.flush()
    notify(
        "signup",
        "New account created",
        f"{user.first_name} {user.last_name} created a new account.",
        related_type="user",
        related_id=user.user_id,
    )
    db.session.commit()

    return jsonify(user_schema.dump(user)), 201


@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = User.get_by_email(email) if email else None
    if not user or not user.verifies_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.user_id))
    return jsonify({"access_token": access_token, "user": user_schema.dump(user)}), 200


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def current_user():
    """Return the database account represented by the supplied access token."""
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return jsonify({"message": "Authenticated user was not found."}), 401
    return jsonify(user_schema.dump(user)), 200


@users_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Provide a logout endpoint; the client clears its bearer token locally."""
    return jsonify({"message": "Signed out successfully."}), 200


@users_bp.route("/admin", methods=["GET"])
@admin_required
def admin_list_users():
    """List users for the administrator dashboard with server-side filters."""
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 20, type=int), 1), 100)
    pagination = User.list_for_admin(
        search=request.args.get("search"), role=request.args.get("role")
    ).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify(
        {
            "users": users_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@users_bp.route("/admin", methods=["POST"])
@admin_required
def admin_create_user():
    """Create a standard user; administrators can assign a role afterwards."""
    try:
        data = user_register_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422
    if User.get_by_email(data["email"]):
        return jsonify({"error": "Email already registered"}), 409
    user = User.create_from_registration(data)
    db.session.add(user)
    db.session.commit()
    return jsonify(user_schema.dump(user)), 201


@users_bp.route("/admin/<int:user_id>", methods=["GET"])
@admin_required
def admin_get_user(user_id):
    """Return one user for administrator management screens."""
    return jsonify(user_schema.dump(db.get_or_404(User, user_id))), 200


@users_bp.route("/admin/<int:user_id>", methods=["PATCH"])
@admin_required
def admin_update_user(user_id):
    """Allow an administrator to update a user profile or application role."""
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404
    try:
        data = admin_user_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422
    if "email" in data:
        email_owner = User.get_by_email(data["email"])
        if email_owner and email_owner.user_id != user.user_id:
            return jsonify({"error": "Email already registered"}), 409
    for key, value in data.items():
        setattr(user, key, value)
    db.session.commit()
    return jsonify(user_schema.dump(user)), 200


@users_bp.route("/admin/<int:user_id>", methods=["DELETE"])
@admin_required
def admin_delete_user(user_id):
    """Delete a user while preventing an administrator from deleting themself."""
    current_user = get_authenticated_user()
    if current_user.user_id == user_id:
        return jsonify({"message": "You cannot delete your own account."}), 400
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404
    db.session.delete(user)
    db.session.commit()
    return "", 204


@users_bp.route("", methods=["GET"])
def list_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search")
    location = request.args.get("location")
    education_level = request.args.get("education_level")
    poverty_classification = request.args.get("poverty_classification")

    query = User.query

    if search:
        like = f"%{search}%"
        query = query.filter(
            (User.first_name.ilike(like))
            | (User.last_name.ilike(like))
            | (User.email.ilike(like))
        )
    if location:
        query = query.filter(User.location.ilike(f"%{location}%"))
    if education_level:
        query = query.filter_by(education_level=education_level)
    if poverty_classification:
        query = query.filter_by(poverty_classification=poverty_classification)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "users": users_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = db.get_or_404(User, user_id)
    return jsonify(user_schema.dump(user)), 200


@users_bp.route("/<int:user_id>", methods=["PATCH"])
@jwt_required()
def update_user(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({"error": "Not authorized to update this user"}), 403

    user = db.get_or_404(User, user_id)

    try:
        data = user_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    for key, value in data.items():
        setattr(user, key, value)

    db.session.commit()
    return jsonify(user_schema.dump(user)), 200


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({"error": "Not authorized to delete this user"}), 403

    user = db.get_or_404(User, user_id)
    db.session.delete(user)
    db.session.commit()
    return "", 204