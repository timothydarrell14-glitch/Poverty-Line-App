from app import create_app
from app.models.users import User


def test_app_exists():
    """Sanity check that the app factory creates a Flask app."""
    app = create_app()
    assert app is not None


def test_user_admin_role_check_is_case_insensitive():
	"""The model is the source of truth for the administrator-role check."""
	admin = User(first_name="Admin", last_name="User", email="admin@example.com", password_hash="hash", role="ADMIN")
	non_admin = User(first_name="Member", last_name="User", email="member@example.com", password_hash="hash", role="user")

	assert admin.is_admin() is True
	assert non_admin.is_admin() is False
