from tests.test_auth import register_and_login


def create_organisation_and_job(client, token):
    org_response = client.post(
        "/organisations",
        json={
            "name": "Test Org",
            "organisation_type": "NGO",
            "email": "org@example.com",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    organisation_id = org_response.get_json()["organisation_id"]

    job_response = client.post(
        "/jobs",
        json={
            "organisation_id": organisation_id,
            "title": "Test Job",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    job_id = job_response.get_json()["job_id"]

    return job_id


def test_apply_to_job_success(client):
    token, _ = register_and_login(client, "applicant@example.com")
    job_id = create_organisation_and_job(client, token)

    response = client.post(
        "/job-applications",
        json={"job_id": job_id},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["job_id"] == job_id
    assert data["status"] == "pending"


def test_duplicate_job_application_fails(client):
    token, _ = register_and_login(client, "duplicateapplicant@example.com")
    job_id = create_organisation_and_job(client, token)

    first_response = client.post(
        "/job-applications",
        json={"job_id": job_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert first_response.status_code == 201

    second_response = client.post(
        "/job-applications",
        json={"job_id": job_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert second_response.status_code == 409


def test_user_cannot_view_another_users_application(client):
    token_a, _ = register_and_login(client, "usera2@example.com")
    token_b, _ = register_and_login(client, "userb2@example.com")
    job_id = create_organisation_and_job(client, token_a)

    application_response = client.post(
        "/job-applications",
        json={"job_id": job_id},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    application_id = application_response.get_json()["application_id"]

    view_response = client.get(
        f"/job-applications/{application_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )

    assert view_response.status_code == 403
