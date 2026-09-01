from app.extensions import db
from app.models.Classification.assessment_questions import AssessmentQuestion
from tests.test_auth import register_and_login


def test_calculate_score_with_no_responses_fails(client):
    token, _ = register_and_login(client, "noresponses@example.com")

    response = client.post(
        "/api/assessment-responses/calculate",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400


def test_calculate_score_with_responses_succeeds(client, app):
    with app.app_context():
        question = AssessmentQuestion(
            question_text="What is your average monthly household income?",
            category="Income",
            question_type="numeric",
            weight=25.00,
            is_required=True,
            is_active=True,
        )
        db.session.add(question)
        db.session.commit()
        question_id = question.question_id

    token, _ = register_and_login(client, "hasresponses@example.com")

    client.post(
        "/api/assessment-responses",
        json={"question_id": question_id, "answer": "2000"},
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.post(
        "/api/assessment-responses/calculate",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["poverty_score"] == 25.0
    assert data["poverty_classification"] == "Low Poverty Risk"
