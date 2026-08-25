from sqlalchemy import func

from app.extensions import db
from app.models.user import User


def register_user(data):

    email = data["email"].strip().lower()

    # Check case-insensitive duplicate email
    existing_user = User.query.filter(
        func.lower(User.email) == email
    ).first()

    if existing_user:
        raise ValueError(
            "User with this email already exists"
        )

    user = User(
        name=data["name"].strip(),
        email=email
    )

    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return user


def authenticate_user(email, password):

    email = email.strip().lower()

    user = User.query.filter(
        func.lower(User.email) == email
    ).first()

    if not user:
        return None

    if not user.check_password(password):
        return None

    if not user.is_active:
        return None

    return user