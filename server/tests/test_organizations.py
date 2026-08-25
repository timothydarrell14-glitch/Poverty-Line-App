import pytest


# ============================================================
# ORGANIZATION FIXTURE
# ============================================================

@pytest.fixture
def organization_payload():
    return {
        "name": "Test Organization",
        "organization_type": "NGO",
        "description": "An organization for testing",
        "mission": "Supporting vulnerable communities",
        "service_area": "Nairobi",
        "email": "testorg@example.com",
        "phone": "+254711111111",
        "website": "https://testorg.org",
    }


# ============================================================
# TEST 1 - CREATE ORGANIZATION
# ============================================================

def test_create_organization(
    client,
    organization_payload,
    auth_headers
):

    response = client.post(
        "/api/organizations",
        json=organization_payload,
        headers=auth_headers
    )

    print("\n========================================")
    print("STATUS CODE:", response.status_code)
    print("RESPONSE JSON:", response.get_json())
    print("RAW RESPONSE:", response.data.decode())
    print("HEADERS:", dict(response.headers))
    print("========================================\n")

    assert response.status_code == 201

    data = response.get_json()

    assert data["message"] == "Organization created successfully"
    assert "organization" in data
    assert "id" in data["organization"]
    assert data["organization"]["name"] == "Test Organization"
    assert data["organization"]["email"] == "testorg@example.com"


# ============================================================
# TEST 2 - GET ALL ORGANIZATIONS
# ============================================================

def test_get_all_organizations(
    client,
    organization_payload,
    auth_headers
):

    create_response = client.post(
        "/api/organizations",
        json=organization_payload,
        headers=auth_headers
    )

    assert create_response.status_code == 201

    response = client.get(
        "/api/organizations"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert "organizations" in data
    assert isinstance(data["organizations"], list)
    assert len(data["organizations"]) >= 1


# ============================================================
# TEST 3 - GET ORGANIZATION BY ID
# ============================================================

def test_get_organization_by_id(
    client,
    organization_payload,
    auth_headers
):

    create_response = client.post(
        "/api/organizations",
        json=organization_payload,
        headers=auth_headers
    )

    assert create_response.status_code == 201

    created_data = create_response.get_json()

    organization_id = created_data["organization"]["id"]

    response = client.get(
        f"/api/organizations/{organization_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert "organization" in data
    assert data["organization"]["id"] == organization_id


# ============================================================
# TEST 4 - UPDATE ORGANIZATION
# ============================================================

def test_update_organization(
    client,
    organization_payload,
    auth_headers
):

    create_response = client.post(
        "/api/organizations",
        json=organization_payload,
        headers=auth_headers
    )

    assert create_response.status_code == 201

    created_data = create_response.get_json()

    organization_id = created_data["organization"]["id"]

    update_data = {
        "name": "Updated Organization",
        "description": "Updated description",
        "mission": "Updated mission",
        "service_area": "Kiambu",
    }

    response = client.put(
        f"/api/organizations/{organization_id}",
        json=update_data,
        headers=auth_headers
    )

    assert response.status_code == 200

    data = response.get_json()

    assert "organization" in data
    assert data["organization"]["id"] == organization_id
    assert data["organization"]["name"] == "Updated Organization"


# ============================================================
# TEST 5 - DELETE ORGANIZATION
# ============================================================

def test_delete_organization(
    client,
    organization_payload,
    auth_headers
):

    create_response = client.post(
        "/api/organizations",
        json=organization_payload,
        headers=auth_headers
    )

    assert create_response.status_code == 201

    created_data = create_response.get_json()

    organization_id = created_data["organization"]["id"]

    response = client.delete(
        f"/api/organizations/{organization_id}",
        headers=auth_headers
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Organization deleted successfully"

    get_response = client.get(
        f"/api/organizations/{organization_id}"
    )

    assert get_response.status_code == 404


# ============================================================
# TEST 6 - INVALID EMAIL
# ============================================================

def test_create_organization_invalid_email(
    client,
    organization_payload,
    auth_headers
):

    data = organization_payload.copy()

    data["email"] = "invalid-email"

    response = client.post(
        "/api/organizations",
        json=data,
        headers=auth_headers
    )

    assert response.status_code == 400


# ============================================================
# TEST 7 - MISSING REQUIRED FIELDS
# ============================================================

def test_create_organization_missing_required_fields(
    client,
    auth_headers
):

    response = client.post(
        "/api/organizations",
        json={},
        headers=auth_headers
    )

    assert response.status_code == 400


# ============================================================
# TEST 8 - ORGANIZATION NOT FOUND
# ============================================================

def test_get_organization_not_found(client):

    response = client.get(
        "/api/organizations/999999"
    )

    assert response.status_code == 404


# ============================================================
# TEST 9 - UPDATE ORGANIZATION NOT FOUND
# ============================================================

def test_update_organization_not_found(
    client,
    auth_headers
):

    response = client.put(
        "/api/organizations/999999",
        json={
            "name": "Updated Organization"
        },
        headers=auth_headers
    )

    assert response.status_code == 404


# ============================================================
# TEST 10 - DELETE ORGANIZATION NOT FOUND
# ============================================================

def test_delete_organization_not_found(
    client,
    auth_headers
):

    response = client.delete(
        "/api/organizations/999999",
        headers=auth_headers
    )

    assert response.status_code == 404


# ============================================================
# TEST 11 - DUPLICATE EMAIL
# ============================================================

def test_create_organization_duplicate_email(
    client,
    organization_payload,
    auth_headers
):

    first_response = client.post(
        "/api/organizations",
        json=organization_payload,
        headers=auth_headers
    )

    assert first_response.status_code == 201

    second_data = organization_payload.copy()

    second_data["name"] = "Another Organization"

    second_response = client.post(
        "/api/organizations",
        json=second_data,
        headers=auth_headers
    )

    assert second_response.status_code == 400

    data = second_response.get_json()

    assert data["message"] == (
        "Organization with this email already exists"
    )


# ============================================================
# TEST 12 - EMPTY NAME
# ============================================================

def test_create_organization_empty_name(
    client,
    auth_headers
):

    response = client.post(
        "/api/organizations",
        json={
            "name": "   ",
            "organization_type": "NGO",
            "description": "Testing empty organization name",
            "mission": "Testing validation",
            "service_area": "Nairobi",
            "email": "emptyname@example.com",
            "phone": "+254711111111",
            "website": "https://emptyname.org",
        },
        headers=auth_headers
    )

    assert response.status_code == 400


# ============================================================
# TEST 13 - EMPTY EMAIL
# ============================================================

def test_create_organization_empty_email(
    client,
    auth_headers
):

    response = client.post(
        "/api/organizations",
        json={
            "name": "Empty Email Organization",
            "organization_type": "NGO",
            "description": "Testing empty email",
            "mission": "Testing validation",
            "service_area": "Nairobi",
            "email": "   ",
            "phone": "+254711111111",
            "website": "https://emptyemail.org",
        },
        headers=auth_headers
    )

    assert response.status_code == 400


# ============================================================
# TEST 14 - INVALID ORGANIZATION TYPE
# ============================================================

def test_create_organization_invalid_type(
    client,
    auth_headers
):

    response = client.post(
        "/api/organizations",
        json={
            "name": "Invalid Type Organization",
            "organization_type": "INVALID_TYPE",
            "description": "Testing organization type",
            "mission": "Testing validation",
            "service_area": "Nairobi",
            "email": "invalidtype@example.com",
            "phone": "+254711111111",
            "website": "https://invalidtype.org",
        },
        headers=auth_headers
    )

    assert response.status_code == 400


# ============================================================
# TEST 15 - INVALID WEBSITE
# ============================================================

def test_create_organization_invalid_website(
    client,
    auth_headers
):

    response = client.post(
        "/api/organizations",
        json={
            "name": "Invalid Website Organization",
            "organization_type": "NGO",
            "description": "Testing website validation",
            "mission": "Testing validation",
            "service_area": "Nairobi",
            "email": "invalidwebsite@example.com",
            "phone": "+254711111111",
            "website": "not-a-valid-url",
        },
        headers=auth_headers
    )

    assert response.status_code == 400


# ============================================================
# TEST 16 - UPDATE WITH DUPLICATE EMAIL
# ============================================================

def test_update_organization_duplicate_email(
    client,
    auth_headers
):

    first_response = client.post(
        "/api/organizations",
        json={
            "name": "First Organization",
            "organization_type": "NGO",
            "email": "first@example.com",
            "description": "First organization",
            "mission": "First mission",
            "service_area": "Nairobi",
        },
        headers=auth_headers
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/organizations",
        json={
            "name": "Second Organization",
            "organization_type": "NGO",
            "email": "second@example.com",
            "description": "Second organization",
            "mission": "Second mission",
            "service_area": "Kiambu",
        },
        headers=auth_headers
    )

    assert second_response.status_code == 201

    second_data = second_response.get_json()

    second_id = second_data["organization"]["id"]

    update_response = client.put(
        f"/api/organizations/{second_id}",
        json={
            "email": "first@example.com"
        },
        headers=auth_headers
    )

    assert update_response.status_code == 400

    data = update_response.get_json()

    assert data["message"] == (
        "Organization with this email already exists"
    )


# ============================================================
# TEST 17 - INVALID PHONE
# ============================================================

def test_create_organization_invalid_phone(
    client,
    auth_headers
):

    response = client.post(
        "/api/organizations",
        json={
            "name": "Invalid Phone Organization",
            "organization_type": "NGO",
            "description": "Testing phone validation",
            "mission": "Testing validation",
            "service_area": "Nairobi",
            "email": "invalidphone@example.com",
            "phone": "abc123",
            "website": "https://invalidphone.org",
        },
        headers=auth_headers
    )

    assert response.status_code == 400


# ============================================================
# TEST 18 - EMAIL CASE NORMALIZATION
# ============================================================

def test_create_organization_email_case_normalization(
    client,
    auth_headers
):

    first_response = client.post(
        "/api/organizations",
        json={
            "name": "FoodForward",
            "organization_type": "NGO",
            "description": "Food distribution organization",
            "mission": "Reducing food insecurity",
            "service_area": "Nairobi",
            "email": "FoodForward@example.com",
            "phone": "+254755555555",
            "website": "https://foodforward.org",
        },
        headers=auth_headers
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/organizations",
        json={
            "name": "FoodForward Kenya",
            "organization_type": "NGO",
            "description": "Another organization",
            "mission": "Supporting communities",
            "service_area": "Kiambu",
            "email": "foodforward@example.com",
            "phone": "+254766666666",
            "website": "https://foodforwardkenya.org",
        },
        headers=auth_headers
    )

    assert second_response.status_code == 400

    data = second_response.get_json()

    assert data["message"] == (
        "Organization with this email already exists"
    )
