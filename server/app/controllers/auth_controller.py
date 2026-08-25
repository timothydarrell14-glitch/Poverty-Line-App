from flask import request, jsonify
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError

from app.extensions import db
from app.schemas.auth_schema import (
    register_schema,
    login_schema
)
from app.services.auth_service import (
    register_user,
    authenticate_user
)


# ============================================================
# REGISTER
# ============================================================

def register():

    try:
        json_data = request.get_json()

        if not json_data:
            return jsonify({
                "message": "Validation error",
                "errors": {
                    "body": [
                        "Request body is required."
                    ]
                }
            }), 400

        data = register_schema.load(json_data)

        user = register_user(data)

        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "is_active": user.is_active
            }
        }), 201

    except ValidationError as error:

        return jsonify({
            "message": "Validation error",
            "errors": error.messages
        }), 400

    except ValueError as error:

        db.session.rollback()

        return jsonify({
            "message": str(error)
        }), 400

    except Exception as error:

        db.session.rollback()

        # TEMPORARY: expose the actual error while debugging
        print("REGISTER ERROR:", repr(error))

        return jsonify({
            "message": "Failed to register user",
            "error": str(error)
        }), 500


# ============================================================
# LOGIN
# ============================================================

def login():

    try:
        json_data = request.get_json()

        if not json_data:
            return jsonify({
                "message": "Validation error",
                "errors": {
                    "body": [
                        "Request body is required."
                    ]
                }
            }), 400

        data = login_schema.load(json_data)

        user = authenticate_user(
            data["email"],
            data["password"]
        )

        if not user:
            return jsonify({
                "message": "Invalid email or password"
            }), 401

        access_token = create_access_token(
            identity=str(user.id)
        )

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200

    except ValidationError as error:

        return jsonify({
            "message": "Validation error",
            "errors": error.messages
        }), 400

    except Exception as error:

        print("LOGIN ERROR:", repr(error))

        return jsonify({
            "message": "Failed to login",
            "error": str(error)
        }), 500