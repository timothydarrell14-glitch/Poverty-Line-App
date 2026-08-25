from functools import wraps

from flask import jsonify

from flask_jwt_extended import get_jwt


def role_required(required_role):
    """
    Restrict an endpoint to users with a specific role.
    """

    def decorator(function):

        @wraps(function)
        def wrapper(*args, **kwargs):

            claims = get_jwt()

            user_role = claims.get("role")

            if user_role != required_role:

                return jsonify({
                    "message": "Access denied",
                    "error": "Insufficient permissions"
                }), 403

            return function(*args, **kwargs)

        return wrapper

    return decorator