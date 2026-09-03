from flask_jwt_extended import create_access_token

from app.extensions import db
from app.models.donations.financialDonations import FinancialDonation
from app.models.programs import Program
from app.models.users.donors import Donor
from app.models.users.organisations import Organisation
from app.models.users.users import User


def create_program(app):
    with app.app_context():
        user = User(
            first_name="Owner",
            last_name="User",
            email="owner@example.com",
            password_hash="unused",
        )
        db.session.add(user)
        db.session.flush()
        organisation = Organisation(
            owner_user_id=user.user_id,
            name="Community Organisation",
            organisation_type="NGO",
        )
        db.session.add(organisation)
        db.session.flush()
        program = Program(
            organisation_id=organisation.organisation_id,
            title="Food Support",
            description="Community food support.",
        )
        db.session.add(program)
        db.session.commit()
        return program.id


def test_targeted_guest_donation_has_no_donor(client, app):
    program_id = create_program(app)

    response = client.post(
        "/api/donations",
        json={
            "program_id": program_id,
            "amount": 500,
            "payment_method": "mpesa",
            "donor_phone": "+254712345678",
        },
    )

    assert response.status_code == 201
    with app.app_context():
        donation = FinancialDonation.query.one()
        assert donation.program_id == program_id
        assert donation.donor_id is None
        assert donation.payment_status == "pending"


def test_mpesa_rejects_foreign_phone_number(client):
    response = client.post(
        "/api/donations",
        json={
            "amount": 500,
            "payment_method": "mpesa",
            "donor_phone": "+447123456789",
        },
    )

    assert response.status_code == 422
    assert "Kenyan" in response.get_json()["message"]


def test_logged_in_donation_links_donor_to_user(client, app):
    with app.app_context():
        user = User(
            first_name="Logged",
            last_name="Donor",
            email="logged@example.com",
            password_hash="unused",
        )
        db.session.add(user)
        db.session.commit()
        token = create_access_token(identity=str(user.user_id))

    response = client.post(
        "/api/donations",
        headers={"Authorization": f"Bearer {token}"},
        json={"amount": 750, "payment_method": "paypal"},
    )

    assert response.status_code == 201
    with app.app_context():
        donation = FinancialDonation.query.one()
        donor = Donor.query.one()
        assert donation.donor_id == donor.id
        assert donor.user_id == user.user_id
        assert donation.program_id is None


def test_general_guest_donation_creates_account_and_donor(client, app):
    response = client.post(
        "/api/donations",
        json={
            "amount": 1000,
            "payment_method": "paypal",
            "donor_name": "Guest Donor",
            "donor_email": "guest@example.com",
            "donor_phone": "+254700000000",
        },
    )

    assert response.status_code == 201
    assert response.get_json()["account_created"] is True
    with app.app_context():
        user = User.get_by_email("guest@example.com")
        donor = Donor.query.one()
        donation = FinancialDonation.query.one()
        assert user is not None
        assert donor.user_id == user.user_id
        assert donation.donor_id == donor.id
        assert donation.program_id is None


def test_mpesa_callback_requires_token(client, monkeypatch):
    monkeypatch.setenv("MPESA_CALLBACK_TOKEN", "callback-secret")
    response = client.post(
        "/api/donations/payments/mpesa/callback",
        json={"Body": {"stkCallback": {"CheckoutRequestID": "checkout-1", "ResultCode": 0}}},
    )

    assert response.status_code == 401


def test_mpesa_callback_is_idempotent(client, app, monkeypatch):
    monkeypatch.setenv("MPESA_CALLBACK_TOKEN", "callback-secret")
    with app.app_context():
        donation = FinancialDonation(
            amount=100,
            currency="KES",
            payment_method="mpesa",
            payment_status="pending",
            provider_reference="checkout-1",
        )
        db.session.add(donation)
        db.session.commit()

    payload = {
        "Body": {
            "stkCallback": {
                "CheckoutRequestID": "checkout-1",
                "ResultCode": 0,
                "CallbackMetadata": {"Item": [{"Name": "MpesaReceiptNumber", "Value": "receipt-1"}]},
            }
        }
    }
    first = client.post("/api/donations/payments/mpesa/callback?token=callback-secret", json=payload)
    second = client.post("/api/donations/payments/mpesa/callback?token=callback-secret", json=payload)

    assert first.status_code == 200
    assert second.get_json()["duplicate"] is True
