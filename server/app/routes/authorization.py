"""Reusable authorization helpers for protected API routes."""

from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.users import User


def get_authenticated_user():
    """Return the database user represented by the current JWT identity."""
    identity = get_jwt_identity()
    if identity is None:
        return None

    try:
        return db.session.get(User, int(identity))
    except (TypeError, ValueError):
        return None


def admin_required(view):
    """Require a JWT for a user whose database role is ``admin``.

    The database is the source of truth for roles. This makes role changes take
    effect immediately rather than waiting for a token containing old claims to
    expire.
    """

    @wraps(view)
    @jwt_required()
    def wrapped_view(*args, **kwargs):
        user = get_authenticated_user()
        if user is None:
            return jsonify({"message": "Authenticated user was not found."}), 401
        if not user.is_admin():
            return jsonify({"message": "Administrator access is required."}), 403
        return view(*args, **kwargs)

    return wrapped_view
