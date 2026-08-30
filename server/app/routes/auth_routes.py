from flask import Blueprint, jsonify
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
