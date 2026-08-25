import pytest

from flask import Flask, jsonify
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required
)

from app.utils.decorators import role_required


@pytest.fixture
def app():

    app = Flask(__name__)

    app.config["TESTING"] = True
    app.config["JWT_SECRET_KEY"] = (
        "test-secret-key-that-is-long-enough"
    )

    JWTManager(app)

    @app.route("/admin")
    @jwt_required()
    @role_required("ADMIN")
    def admin():

        return jsonify({
            "message": "Admin access granted"
        }), 200

    @app.route("/user")
    @jwt_required()
    @role_required("USER")
    def user():

        return jsonify({
            "message": "User access granted"
        }), 200

    return app


@pytest.fixture
def client(app):

    return app.test_client()


def test_admin_can_access_admin_endpoint(client, app):

    with app.app_context():

        token = create_access_token(
            identity="1",
            additional_claims={
                "role": "ADMIN"
            }
        )

    response = client.get(
        "/admin",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Admin access granted"


def test_user_cannot_access_admin_endpoint(client, app):

    with app.app_context():

        token = create_access_token(
            identity="1",
            additional_claims={
                "role": "USER"
            }
        )

    response = client.get(
        "/admin",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403

    data = response.get_json()

    assert data["message"] == "Access denied"


def test_user_can_access_user_endpoint(client, app):

    with app.app_context():

        token = create_access_token(
            identity="1",
            additional_claims={
                "role": "USER"
            }
        )

    response = client.get(
        "/user",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "User access granted"


def test_admin_cannot_access_user_endpoint(client, app):

    with app.app_context():

        token = create_access_token(
            identity="1",
            additional_claims={
                "role": "ADMIN"
            }
        )

    response = client.get(
        "/user",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403

    data = response.get_json()

    assert data["message"] == "Access denied"
