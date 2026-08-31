def test_register_user_success(client):
    response = client.post(
        "/api/users/register",
        json={
            "first_name": "Test",
            "last_name": "User",
            "email": "testuser@example.com",
            "password": "testpass123",
        },
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["email"] == "testuser@example.com"
    assert "password_hash" not in data


def test_register_duplicate_email_fails(client):
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": "duplicate@example.com",
        "password": "testpass123",
    }

    first_response = client.post("/api/users/register", json=payload)
    assert first_response.status_code == 201

    second_response = client.post("/api/users/register", json=payload)
    assert second_response.status_code == 409


def test_update_user_without_token_fails(client):
    register_response = client.post(
        "/api/users/register",
        json={
            "first_name": "Test",
            "last_name": "User",
            "email": "notoken@example.com",
            "password": "testpass123",
        },
    )
    user_id = register_response.get_json()["user_id"]

    update_response = client.patch(
        f"/api/users/{user_id}",
        json={"location": "Nairobi"},
    )

    assert update_response.status_code == 401
