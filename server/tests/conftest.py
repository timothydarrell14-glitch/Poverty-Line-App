import pytest

from app import create_app
from app.extensions import db
from app.models.user import User

from flask_jwt_extended import create_access_token


# ============================================================
# APPLICATION FIXTURE
# ============================================================

@pytest.fixture
def app():
    app = create_app("testing")

    with app.app_context():
        db.create_all()

        yield app

        db.session.remove()
        db.drop_all()


# ============================================================
# CLIENT FIXTURE
# ============================================================

@pytest.fixture
def client(app):
    return app.test_client()


# ============================================================
# ADMIN USER FIXTURE
# ============================================================

@pytest.fixture
def admin_user(app):
    with app.app_context():

        user = User(
            name="Admin Test",
            email="admin@test.com",
            role="ADMIN"
        )

        # Set password if the User model supports it
        if hasattr(user, "set_password"):
            user.set_password("Admin123!")

        db.session.add(user)
        db.session.commit()

        # IMPORTANT:
        # Save the ID before leaving the database session.
        user_id = user.id

        return user_id


# ============================================================
# AUTHORIZATION HEADERS FIXTURE
# ============================================================

@pytest.fixture
def auth_headers(app, admin_user):

    with app.app_context():

        # IMPORTANT:
        # flask-jwt-extended requires the JWT identity/sub
        # to be a STRING.
        access_token = create_access_token(
            identity=str(admin_user),
            additional_claims={
                "role": "ADMIN"
            }
        )

        return {
            "Authorization": f"Bearer {access_token}"
        }


# ============================================================
# ORGANIZATION PAYLOAD FIXTURE
# ============================================================

@pytest.fixture
def organization_payload():

    return {
        "name": "Test Organization",
        "organization_type": "NGO",
        "description": "An organization for testing",
        "mission": "Supporting vulnerable communities",
        "service_area": "Nairobi",
        "email": "testorg@example.com",
        "phone": "+254711111111",
        "website": "https://testorg.org",
    }