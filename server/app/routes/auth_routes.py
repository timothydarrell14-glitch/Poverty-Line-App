from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.users import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.get("/me")
@jwt_required()
def current_user():
    """Return the authenticated user's access data from the database."""
    user = db.session.get(User, int(get_jwt_identity()))

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
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return jsonify({"message": "User not found."}), 404

    payload = request.get_json(silent=True) or {}
    first_name = payload.get("first_name", "").strip()
    last_name = payload.get("last_name", "").strip()
    email = payload.get("email", "").strip().lower()

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
