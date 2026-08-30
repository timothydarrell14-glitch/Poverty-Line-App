from app.extensions import db
from tests.test_auth import register_and_login


def make_admin(app, user_id):
	from app.models.users import User

	with app.app_context():
		user = User.query.get(user_id)
		user.role = "admin"
		db.session.commit()


def test_non_admin_cannot_verify_organisation(client, app):
	token, user_id = register_and_login(client, "notadmin@example.com")

	org_response = client.post(
		"/organisations",
		json={"name": "Test Org", "organisation_type": "NGO", "email": "org@example.com"},
		headers={"Authorization": f"Bearer {token}"},
	)
	organisation_id = org_response.get_json()["organisation_id"]

	response = client.patch(
		f"/organisations/{organisation_id}/verify",
		headers={"Authorization": f"Bearer {token}"},
	)

	assert response.status_code == 403


def test_admin_can_verify_organisation(client, app):
	owner_token, _ = register_and_login(client, "owner@example.com")
	admin_token, admin_id = register_and_login(client, "realadmin@example.com")
	make_admin(app, admin_id)

	org_response = client.post(
		"/organisations",
		json={"name": "Test Org", "organisation_type": "NGO", "email": "org@example.com"},
		headers={"Authorization": f"Bearer {owner_token}"},
	)
	organisation_id = org_response.get_json()["organisation_id"]

	response = client.patch(
		f"/organisations/{organisation_id}/verify",
		headers={"Authorization": f"Bearer {admin_token}"},
	)

	assert response.status_code == 200
	assert response.get_json()["verified"] is True


def test_admin_can_update_job_application_status(client, app):
	org_token, _ = register_and_login(client, "orgowner@example.com")
	applicant_token, _ = register_and_login(client, "applicant2@example.com")
	admin_token, admin_id = register_and_login(client, "admin2@example.com")
	make_admin(app, admin_id)

	org_response = client.post(
		"/organisations",
		json={"name": "Test Org", "organisation_type": "NGO", "email": "org2@example.com"},
		headers={"Authorization": f"Bearer {org_token}"},
	)
	organisation_id = org_response.get_json()["organisation_id"]

	job_response = client.post(
		"/jobs",
		json={"organisation_id": organisation_id, "title": "Test Job"},
		headers={"Authorization": f"Bearer {org_token}"},
	)
	job_id = job_response.get_json()["job_id"]

	application_response = client.post(
		"/job-applications",
		json={"job_id": job_id},
		headers={"Authorization": f"Bearer {applicant_token}"},
	)
	application_id = application_response.get_json()["application_id"]

	response = client.patch(
		f"/job-applications/{application_id}/status",
		json={"status": "accepted"},
		headers={"Authorization": f"Bearer {admin_token}"},
	)

	assert response.status_code == 200
	assert response.get_json()["status"] == "accepted"


def test_invalid_status_value_rejected(client, app):
	org_token, _ = register_and_login(client, "orgowner2@example.com")
	applicant_token, _ = register_and_login(client, "applicant3@example.com")
	admin_token, admin_id = register_and_login(client, "admin3@example.com")
	make_admin(app, admin_id)

	org_response = client.post(
		"/organisations",
		json={"name": "Test Org", "organisation_type": "NGO", "email": "org3@example.com"},
		headers={"Authorization": f"Bearer {org_token}"},
	)
	organisation_id = org_response.get_json()["organisation_id"]

	job_response = client.post(
		"/jobs",
		json={"organisation_id": organisation_id, "title": "Test Job"},
		headers={"Authorization": f"Bearer {org_token}"},
	)
	job_id = job_response.get_json()["job_id"]

	application_response = client.post(
		"/job-applications",
		json={"job_id": job_id},
		headers={"Authorization": f"Bearer {applicant_token}"},
	)
	application_id = application_response.get_json()["application_id"]

	response = client.patch(
		f"/job-applications/{application_id}/status",
		json={"status": "maybe"},
		headers={"Authorization": f"Bearer {admin_token}"},
	)

	assert response.status_code == 422