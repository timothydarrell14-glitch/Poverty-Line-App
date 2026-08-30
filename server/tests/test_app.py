from app import create_app
from app.extensions import db
from app.models.organisations import Organisation
from app.models.programs import Program
from app.models.users import User
from werkzeug.security import generate_password_hash


def build_test_app():
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["JWT_SECRET_KEY"] = "test-secret-key"
    with app.app_context():
        db.drop_all()
        db.create_all()
    return app


def create_admin_user(email="admin@example.com", password="StrongPass123!"):
    user = User(
        first_name="Admin",
        last_name="User",
        email=email,
        password_hash=generate_password_hash(password),
        role="admin",
        is_active=True,
    )
    db.session.add(user)
    db.session.commit()
    return user


def test_app_exists():
    """Sanity check that the app factory creates a Flask app."""
    app = create_app()
    assert app is not None


def test_current_user_requires_authentication():
    """The role endpoint must not disclose access details to anonymous users."""
    app = build_test_app()

    response = app.test_client().get("/api/auth/me")

    assert response.status_code == 401


def test_login_and_logout_flow():
    app = build_test_app()
    with app.app_context():
        create_admin_user()

    client = app.test_client()
    login_response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "StrongPass123!"},
    )

    assert login_response.status_code == 200
    token = login_response.get_json()["access_token"]
    assert token

    me_response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.get_json()["user"]["email"] == "admin@example.com"

    logout_response = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_response.status_code == 200
    assert logout_response.get_json()["message"] == "Logged out successfully."


def test_non_admin_cannot_manage_users_or_programs():
    app = build_test_app()
    with app.app_context():
        db.session.add(
            User(
                first_name="Guest",
                last_name="User",
                email="guest@example.com",
                password_hash=generate_password_hash("Password123!"),
                role="user",
                is_active=True,
            )
        )
        db.session.commit()

    client = app.test_client()
    login_response = client.post(
        "/api/auth/login",
        json={"email": "guest@example.com", "password": "Password123!"},
    )
    token = login_response.get_json()["access_token"]

    users_response = client.get("/api/auth/users", headers={"Authorization": f"Bearer {token}"})
    assert users_response.status_code == 403
    assert users_response.get_json()["message"] == "Admin access required."

    programs_response = client.get("/api/auth/programs", headers={"Authorization": f"Bearer {token}"})
    assert programs_response.status_code == 403
    assert programs_response.get_json()["message"] == "Admin access required."


def test_admin_can_create_program_for_organisation():
    app = build_test_app()
    with app.app_context():
        create_admin_user()
        org = Organisation(name="Community Care", organisation_type="Nonprofit", description="Helps families", verified=True)
        db.session.add(org)
        db.session.commit()

    client = app.test_client()
    login_response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "StrongPass123!"},
    )
    token = login_response.get_json()["access_token"]

    create_response = client.post(
        "/api/auth/programs",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={
            "name": "School Meals",
            "description": "Daily healthy lunches",
            "organisation_id": 1,
            "status": "Active",
            "location": "Northside",
        },
    )

    assert create_response.status_code == 201
    payload = create_response.get_json()
    assert payload["program"]["title"] == "School Meals"
    assert payload["program"]["location"] == "Northside"

    with app.app_context():
        stored = Program.query.first()
        assert stored is not None
        assert stored.organisation_id == 1
