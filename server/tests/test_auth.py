def register_and_login(client, email):
	client.post(
		"/users/register",
		json={
			"first_name": "Test",
			"last_name": "User",
			"email": email,
			"password": "testpass123",
		},
	)
	login_response = client.post(
		"/users/login",
		json={"email": email, "password": "testpass123"},
	)
	data = login_response.get_json()
	return data["access_token"], data["user"]["user_id"]


def test_login_success(client):
	token, user_id = register_and_login(client, "logintest@example.com")

	assert token is not None
	assert user_id is not None


def test_login_wrong_password_fails(client):
	client.post(
		"/users/register",
		json={
			"first_name": "Test",
			"last_name": "User",
			"email": "wrongpass@example.com",
			"password": "testpass123",
		},
	)

	response = client.post(
		"/users/login",
		json={"email": "wrongpass@example.com", "password": "incorrectpassword"},
	)

	assert response.status_code == 401


def test_user_cannot_update_another_users_profile(client):
	token_a, user_id_a = register_and_login(client, "usera@example.com")
	token_b, user_id_b = register_and_login(client, "userb@example.com")

	response = client.patch(
		f"/users/{user_id_b}",
		json={"location": "Nairobi"},
		headers={"Authorization": f"Bearer {token_a}"},
	)

	assert response.status_code == 403