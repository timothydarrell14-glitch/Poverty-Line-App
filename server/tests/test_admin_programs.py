from app.extensions import db
from app.models.users import User


def admin_token(client, app):
    client.post(
        "/users/register",
        json={
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin-programs@example.com",
            "password": "testpass123",
        },
    )
    with app.app_context():
        user = User.get_by_email("admin-programs@example.com")
        user.role = "admin"
        db.session.commit()
    login = client.post(
        "/users/login",
        json={"email": "admin-programs@example.com", "password": "testpass123"},
    )
    return {"Authorization": f"Bearer {login.get_json()['access_token']}"}


def test_admin_can_create_organisation_and_program(client, app):
    headers = admin_token(client, app)
    organisation = client.post(
        "/organisations/admin",
        headers=headers,
        json={
            "name": "Poverty Line Partners",
            "organisation_type": "Nonprofit",
            "email": "partners@example.com",
        },
    )
    assert organisation.status_code == 201

    program = client.post(
        "/programs/admin",
        headers=headers,
        json={
            "organisation_id": organisation.get_json()["organisation_id"],
            "name": "Community Nutrition",
            "description": "Local food support.",
            "category": "Food Security",
        },
    )
    assert program.status_code == 201

    listing = client.get("/programs/admin?search=nutrition", headers=headers)
    assert listing.status_code == 200
    assert listing.get_json()["total"] == 1
