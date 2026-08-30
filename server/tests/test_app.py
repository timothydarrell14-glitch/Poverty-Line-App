from app import create_app


def test_app_exists():
    """Sanity check that the app factory creates a Flask app."""
    app = create_app()
    assert app is not None


def test_current_user_requires_authentication():
    """The role endpoint must not disclose access details to anonymous users."""
    app = create_app()

    response = app.test_client().get("/api/auth/me")

    assert response.status_code == 401
