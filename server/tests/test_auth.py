def register_and_login(client, email):
    client.post(
        "/api/users/register",
        json={
            "first_name": "Test",
            "last_name": "User",
            "email": email,
            "password": "testpass123",
        },
    )
    login_response = client.post(
        "/api/users/login",
        json={"email": email, "password": "testpass123"},
    )
    data = login_response.get_json()
    return data["access_token"], data["user"]["user_id"]


def test_login_success(client):
    token, user_id = register_and_login(client, "logintest@example.com")

    assert token is not None
    assert user_id is not None


def test_login_wrong_password_fails(client):
    client.post(
        "/api/users/register",
        json={
            "first_name": "Test",
            "last_name": "User",
            "email": "wrongpass@example.com",
            "password": "testpass123",
        },
    )

    response = client.post(
        "/api/users/login",
        json={"email": "wrongpass@example.com", "password": "incorrectpassword"},
    )

    assert response.status_code == 401


def test_user_cannot_update_another_users_profile(client):
    token_a, user_id_a = register_and_login(client, "usera@example.com")
    token_b, user_id_b = register_and_login(client, "userb@example.com")

    response = client.patch(
        f"/api/users/{user_id_b}",
        json={"location": "Nairobi"},
        headers={"Authorization": f"Bearer {token_a}"},
    )

    assert response.status_code == 403


def test_current_user_returns_authenticated_account(client):
    token, user_id = register_and_login(client, "current@example.com")

    response = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.get_json()["user_id"] == user_id
    assert response.get_json()["role"] == "user"


def test_logout_requires_a_valid_token(client):
    response = client.post("/api/users/logout")
    assert response.status_code == 401
    assert response.get_json()["message"] == "Authentication is required."


def test_current_user_response_uses_the_user_schema(client):
    token, _ = register_and_login(client, "schema@example.com")

    response = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert "password_hash" not in response.get_json()
    assert response.get_json()["email"] == "schema@example.com"


def test_admin_user_management_requires_an_admin_role(client, app):
    token, user_id = register_and_login(client, "member@example.com")
    member_response = client.get(
        "/api/users/admin", headers={"Authorization": f"Bearer {token}"}
    )
    assert member_response.status_code == 403

    from app.extensions import db
    from app.models.users.users import User

    with app.app_context():
        user = db.session.get(User, user_id)
        user.role = "admin"
        db.session.commit()

    admin_response = client.get(
        "/api/users/admin", headers={"Authorization": f"Bearer {token}"}
    )
    assert admin_response.status_code == 200
    assert admin_response.get_json()["total"] == 1


def test_admin_cannot_delete_own_account(client, app):
    token, user_id = register_and_login(client, "admin@example.com")
    from app.extensions import db
    from app.models.users.users import User

    with app.app_context():
        user = db.session.get(User, user_id)
        user.role = "admin"
        db.session.commit()

    response = client.delete(
        f"/api/users/admin/{user_id}", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400


def test_api_not_found_response_is_json(client):
    response = client.get("/api/users/99999")
    assert response.status_code == 404
    assert "message" in response.get_json()
