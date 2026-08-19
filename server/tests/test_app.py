from app import create_app


def test_app_exists():
    """Sanity check that the app factory creates a Flask app."""
    app = create_app()
    assert app is not None
