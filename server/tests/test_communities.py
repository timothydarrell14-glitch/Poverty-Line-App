import pytest
from app import create_app
from app.extensions import db
from app.models.communication.community_membership import CommunityMembership
from app.models.users.users import User


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.test_client() as test_client:
        with app.app_context():
            db.drop_all()
            db.create_all()

            user = User(
                first_name="Caroline",
                last_name="Oriama",
                email="carolineoriama@gmail.com",
                password_hash="hashedpass",
            )
            db.session.add(user)
            db.session.commit()
        yield test_client


def test_list_communities(client):
    response = client.get("/api/communities")
    assert response.status_code == 200
    data = response.get_json()
    assert "communities" in data


def test_atomic_community_creation(client):
    payload = {
        "name": "New Aid Group",
        "category": "Food Sharing",
        "description": "Providing meals",
    }
    response = client.post("/api/communities", json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "New Aid Group"

    membership = CommunityMembership.query.filter_by(
        community_id=data["community_id"]
    ).first()
    assert membership is not None
    assert membership.role == "admin"


def test_create_and_list_posts(client):

    c_res = client.post("/api/communities", json={"name": "Test Group"})
    c_id = c_res.get_json()["community_id"]

    p_res = client.post(
        f"/api/communities/{c_id}/posts", json={"content": "Hello community!"}
    )
    assert p_res.status_code == 201
    p_data = p_res.get_json()
    assert p_data["content"] == "Hello community!"
    assert p_data["user"]["first_name"] == "Caroline"

    get_res = client.get(f"/api/communities/{c_id}/posts")
    assert get_res.status_code == 200
    posts = get_res.get_json()["posts"]
    assert len(posts) == 1
    assert posts[0]["content"] == "Hello community!"
