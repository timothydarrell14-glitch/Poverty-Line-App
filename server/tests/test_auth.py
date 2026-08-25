import pytest

from app import create_app
from app.extensions import db


# ============================================================
# APP FIXTURE
# ============================================================

@pytest.fixture
def app():

    app = create_app()

    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
        JWT_SECRET_KEY="test-jwt-secret",
    )

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
# TEST 1
# Successful registration
# ============================================================

def test_register_user(client):

    response = client.post(
        "/api/auth/register",
        json={
            "name": "Antony Mutai",
            "email": "antony@example.com",
            "password": "Password123"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["message"] == "User registered successfully"

    assert data["user"]["name"] == "Antony Mutai"

    assert data["user"]["email"] == "antony@example.com"

    assert data["user"]["is_active"] is True

    assert "id" in data["user"]


# ============================================================
# TEST 2
# Duplicate email
# ============================================================

def test_register_duplicate_email(client):

    first_response = client.post(
        "/api/auth/register",
        json={
            "name": "Antony Mutai",
            "email": "antony@example.com",
            "password": "Password123"
        }
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/auth/register",
        json={
            "name": "Another User",
            "email": "antony@example.com",
            "password": "Password456"
        }
    )

    assert second_response.status_code == 400

    data = second_response.get_json()

    assert data["message"] == (
        "User with this email already exists"
    )


# ============================================================
# TEST 3
# Invalid email
# ============================================================

def test_register_invalid_email(client):

    response = client.post(
        "/api/auth/register",
        json={
            "name": "Antony Mutai",
            "email": "not-an-email",
            "password": "Password123"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "Validation error"

    assert "email" in data["errors"]


# ============================================================
# TEST 4
# Missing required fields
# ============================================================

def test_register_missing_required_fields(client):

    response = client.post(
        "/api/auth/register",
        json={
            "name": "Antony Mutai"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "Validation error"

    assert "email" in data["errors"]

    assert "password" in data["errors"]


# ============================================================
# TEST 5
# Password too short
# ============================================================

def test_register_short_password(client):

    response = client.post(
        "/api/auth/register",
        json={
            "name": "Antony Mutai",
            "email": "antony@example.com",
            "password": "123"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "Validation error"

    assert "password" in data["errors"]


# ============================================================
# TEST 6
# Successful login
# ============================================================

def test_login_success(client):

    register_response = client.post(
        "/api/auth/register",
        json={
            "name": "Antony Mutai",
            "email": "antony@example.com",
            "password": "Password123"
        }
    )

    assert register_response.status_code == 201

    response = client.post(
        "/api/auth/login",
        json={
            "email": "antony@example.com",
            "password": "Password123"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Login successful"

    assert "access_token" in data

    assert data["user"]["email"] == "antony@example.com"


# ============================================================
# TEST 7
# Wrong password
# ============================================================

def test_login_wrong_password(client):

    client.post(
        "/api/auth/register",
        json={
            "name": "Antony Mutai",
            "email": "antony@example.com",
            "password": "Password123"
        }
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "antony@example.com",
            "password": "WrongPassword"
        }
    )

    assert response.status_code == 401

    data = response.get_json()

    assert data["message"] == "Invalid email or password"


# ============================================================
# TEST 8
# Non-existent user
# ============================================================

def test_login_nonexistent_user(client):

    response = client.post(
        "/api/auth/login",
        json={
            "email": "doesnotexist@example.com",
            "password": "Password123"
        }
    )

    assert response.status_code == 401

    data = response.get_json()

    assert data["message"] == "Invalid email or password"


# ============================================================
# TEST 9
# Email case normalization
# ============================================================

def test_register_email_case_normalization(client):

    first_response = client.post(
        "/api/auth/register",
        json={
            "name": "Antony Mutai",
            "email": "Antony@Example.com",
            "password": "Password123"
        }
    )

    assert first_response.status_code == 201

    data = first_response.get_json()

    assert data["user"]["email"] == "antony@example.com"

    second_response = client.post(
        "/api/auth/register",
        json={
            "name": "Another User",
            "email": "ANTONY@example.com",
            "password": "Password456"
        }
    )

    assert second_response.status_code == 400

    second_data = second_response.get_json()

    assert second_data["message"] == (
        "User with this email already exists"
    )


# ============================================================
# TEST 10
# Empty request body
# ============================================================

def test_register_empty_body(client):

    response = client.post(
        "/api/auth/register",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "Validation error"