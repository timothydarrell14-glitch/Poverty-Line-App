from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.users import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def serialize_user(user):
    return {"id": user.user_id, "name": f"{user.first_name} {user.last_name}", "email": user.email, "role": user.role, "status": "Active" if user.is_active else "Inactive", "lastActive": user.created_at.strftime("%b %d, %Y") if user.created_at else "Never"}

def admin_user():
    user = db.session.get(User, int(get_jwt_identity()))
    return user if user and user.role.lower() == "admin" else None


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

@auth_bp.get("/users")
@jwt_required()
def list_users():
    if not admin_user(): return jsonify({"message": "Admin access required."}), 403
    return jsonify({"users": [serialize_user(user) for user in User.query.order_by(User.created_at.desc()).all()]})

@auth_bp.post("/users")
@jwt_required()
def create_user():
    if not admin_user(): return jsonify({"message": "Admin access required."}), 403
    data = request.get_json(silent=True) or {}
    required = ["first_name", "last_name", "email", "role", "password"]
    if not all(str(data.get(key, "")).strip() for key in required): return jsonify({"message": "All user fields are required."}), 400
    if User.query.filter_by(email=data["email"].strip().lower()).first(): return jsonify({"message": "That email address is already in use."}), 409
    user = User(first_name=data["first_name"].strip(), last_name=data["last_name"].strip(), email=data["email"].strip().lower(), role=data["role"].strip(), password_hash=generate_password_hash(data["password"]), is_active=True)
    db.session.add(user); db.session.commit()
    return jsonify({"user": serialize_user(user)}), 201

@auth_bp.patch("/users/<int:user_id>")
@jwt_required()
def update_user(user_id):
    admin = admin_user()
    user = db.session.get(User, user_id)
    if not admin: return jsonify({"message": "Admin access required."}), 403
    if not user: return jsonify({"message": "User not found."}), 404
    data = request.get_json(silent=True) or {}
    if "role" in data: user.role = data["role"]
    if "is_active" in data: user.is_active = bool(data["is_active"])
    db.session.commit()
    return jsonify({"user": serialize_user(user)})

@auth_bp.delete("/users/<int:user_id>")
@jwt_required()
def delete_user(user_id):
    admin = admin_user(); user = db.session.get(User, user_id)
    if not admin: return jsonify({"message": "Admin access required."}), 403
    if not user: return jsonify({"message": "User not found."}), 404
    if user.user_id == admin.user_id: return jsonify({"message": "You cannot delete your own account."}), 400
    db.session.delete(user); db.session.commit()
    return "", 204
