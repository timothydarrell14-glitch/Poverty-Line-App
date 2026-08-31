import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest

from app import create_app
from app.extensions import db as _db


@pytest.fixture
def app():
    app = create_app()
    app.config.update(TESTING=True)

    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
