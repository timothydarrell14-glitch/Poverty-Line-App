from flask import Blueprint, request, jsonify
from datetime import date
import hmac
import os
import re

from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from marshmallow import ValidationError
from sqlalchemy import func

from app.extensions import db
from app.models.donations.financialDonations import FinancialDonation
from app.models.programs import Program
from app.models.users.donors import Donor
from app.models.users.users import User
from app.schemas.donations.donation_schema import (
    donation_schema,
    donation_create_schema,
)
from app.services.payment_providers import (
    PaymentProviderError,
    capture_paypal_order,
    create_paypal_fastlane_order,
    get_paypal_browser_safe_client_token,
    initiate_payment,
)
from app.services.notifications import notify
from app.services.program_milestones import check_funding_milestones

donations_bp = Blueprint("donations", __name__, url_prefix="/api/donations")


def notify_donation_completed(donation):
    program_name = donation.program.title if donation.program else "the General Community Fund"
    notify(
        "donation",
        "New donation received",
        f"{donation.currency} {donation.amount} received for {program_name}.",
        related_type="donation",
        related_id=donation.donation_id,
    )
    check_funding_milestones(donation.program)


def fastlane_enabled():
    return os.environ.get("PAYPAL_FASTLANE_ENABLED", "false").lower() == "true"


def normalize_kenyan_mobile(phone):
    normalized = re.sub(r"[\s-]", "", phone or "")
    if normalized.startswith("0"):
        normalized = "+254" + normalized[1:]
    return normalized if re.fullmatch(r"\+254[17]\d{8}", normalized) else None


def serialize_donation(donation):
    payload = donation_schema.dump(donation)
    payload["program_title"] = donation.program.title if donation.program else "General Community Fund"
    return payload


@donations_bp.route("/paypal-api/auth/browser-safe-client-token", methods=["GET"])
def paypal_browser_safe_client_token():
    if not fastlane_enabled():
        return jsonify({"message": "PayPal Fastlane is disabled."}), 404
    try:
        token = get_paypal_browser_safe_client_token()
    except PaymentProviderError as error:
        return jsonify({"message": str(error)}), 502
    if token is None:
        return jsonify({"message": "PayPal is not configured."}), 503
    return jsonify({"accessToken": token}), 200


@donations_bp.route("/paypal-api/checkout/orders/create", methods=["POST"])
def paypal_fastlane_create_order():
    if not fastlane_enabled():
        return jsonify({"message": "PayPal Fastlane is disabled."}), 404
    payload = request.get_json(silent=True) or {}
    if payload.get("intent") != "CAPTURE" or not payload.get("purchase_units"):
        return jsonify({"message": "A capture order with purchase units is required."}), 422
    try:
        order = create_paypal_fastlane_order(payload)
    except PaymentProviderError as error:
        return jsonify({"message": str(error)}), 502
    return jsonify(order), 201


@donations_bp.route("/paypal-api/checkout/orders/capture", methods=["POST"])
def paypal_fastlane_capture_order():
    if not fastlane_enabled():
        return jsonify({"message": "PayPal Fastlane is disabled."}), 404
    order_id = (request.get_json(silent=True) or {}).get("order_id")
    if not order_id:
        return jsonify({"message": "A PayPal order ID is required."}), 422
    try:
        completed = capture_paypal_order(order_id)
    except PaymentProviderError as error:
        return jsonify({"message": str(error)}), 502
    return jsonify({"order_id": order_id, "status": "COMPLETED" if completed else "FAILED"}), 200


@donations_bp.route("", methods=["POST"])
def create_donation():
    try:
        data = donation_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    program_id = data["program_id"]
    if program_id is not None and db.session.get(Program, program_id) is None:
        return jsonify({"message": "Program not found."}), 404
    donor_phone = data.get("donor_phone")
    if data["payment_method"] == "mpesa":
        donor_phone = normalize_kenyan_mobile(donor_phone)
        if donor_phone is None:
            return jsonify(
                {"message": "M-Pesa requires a valid Kenyan mobile number."}
            ), 422

    verify_jwt_in_request(optional=True)
    user = None
    identity = get_jwt_identity()
    if identity is not None:
        user = db.session.get(User, int(identity))
        if user is None:
            return jsonify({"message": "Authenticated user was not found."}), 401

    donor = None
    if user is not None:
        donor = Donor.query.filter_by(user_id=user.user_id).first()
        if donor is None:
            donor = Donor(
                user_id=user.user_id,
                name=f"{user.first_name} {user.last_name}",
                email=user.email,
                phone_number=donor_phone or user.phone,
            )
            db.session.add(donor)
    elif program_id is None:
        if not all((data.get("donor_name"), data.get("donor_email"), data.get("donor_phone"))):
            return jsonify(
                {"message": "Name, email, and phone are required for a general donation."}
            ), 422
        if User.get_by_email(data["donor_email"]):
            return jsonify(
                {"message": "That email already has an account. Please log in to donate."}
            ), 409
        guest_password = User.generate_random_password()
        user = User(
            first_name=data["donor_name"].split()[0],
            last_name=" ".join(data["donor_name"].split()[1:]) or "Donor",
            email=data["donor_email"].lower(),
            password_hash=User.hash_password(guest_password),
            phone=donor_phone or data["donor_phone"],
        )
        donor = Donor(
            user=user,
            name=data["donor_name"],
            email=data["donor_email"].lower(),
            phone_number=donor_phone or data["donor_phone"],
        )
        db.session.add(user)

    donation = FinancialDonation(
        program_id=program_id,
        donor=donor,
        amount=data["amount"],
        currency=data["currency"].upper(),
        payment_method=data["payment_method"],
        payment_status="pending",
        donation_date=date.today(),
    )
    db.session.add(donation)
    db.session.commit()

    try:
        payment = initiate_payment(
            donation,
            phone_number=donor_phone or (donor.phone_number if donor else None),
        )
    except PaymentProviderError as error:
        donation.payment_status = "failed"
        db.session.commit()
        return jsonify({"message": str(error), "donation": serialize_donation(donation)}), 502

    donation.payment_status = payment["status"]
    donation.provider_reference = payment.get("provider_reference")
    if donation.payment_status == "completed":
        notify_donation_completed(donation)
    db.session.commit()

    return jsonify(
        {
            "donation": serialize_donation(donation),
            "payment": {
                "provider": donation.payment_method,
                **payment,
            },
            "account_created": user is not None and identity is None,
        }
    ), 201


@donations_bp.route("/payments/mpesa/callback", methods=["POST"])
def mpesa_callback():
    expected_token = os.environ.get("MPESA_CALLBACK_TOKEN")
    supplied_token = request.args.get("token", "")
    if expected_token and (
        expected_token.lower().startswith("replace-with-")
        or not hmac.compare_digest(supplied_token, expected_token)
    ):
        return jsonify({"message": "Unauthorized callback."}), 401

    if not request.is_json:
        return jsonify({"message": "A JSON callback payload is required."}), 400
    payload = request.get_json(silent=True) or {}
    callback = payload.get("Body", {}).get("stkCallback", {})
    if not isinstance(callback, dict):
        return jsonify({"message": "Invalid M-Pesa callback payload."}), 400
    provider_reference = callback.get("CheckoutRequestID")
    if not provider_reference or not isinstance(callback.get("ResultCode"), int):
        return jsonify({"message": "Invalid M-Pesa callback payload."}), 400
    donation = FinancialDonation.query.filter_by(provider_reference=provider_reference).first()
    if donation is None:
        return jsonify({"message": "Donation not found."}), 404

    result_code = callback.get("ResultCode")
    if donation.payment_status in {"completed", "failed"}:
        return jsonify({"received": True, "duplicate": True}), 200
    donation.payment_status = "completed" if result_code == 0 else "failed"
    metadata = callback.get("CallbackMetadata", {}).get("Item", [])
    if not isinstance(metadata, list):
        return jsonify({"message": "Invalid M-Pesa callback metadata."}), 400
    for item in metadata:
        if not isinstance(item, dict):
            return jsonify({"message": "Invalid M-Pesa callback metadata."}), 400
        if item.get("Name") == "MpesaReceiptNumber":
            receipt = str(item.get("Value"))
            duplicate = FinancialDonation.query.filter(
                FinancialDonation.transaction_code == receipt,
                FinancialDonation.donation_id != donation.donation_id,
            ).first()
            if duplicate:
                return jsonify({"message": "Duplicate M-Pesa receipt."}), 409
            donation.transaction_code = receipt
            break
    if donation.payment_status == "completed":
        notify_donation_completed(donation)
    db.session.commit()
    return jsonify({"received": True}), 200


@donations_bp.route("/payments/paypal/capture", methods=["POST"])
def paypal_capture():
    payload = request.get_json(silent=True) or {}
    donation = db.session.get(FinancialDonation, payload.get("donation_id"))
    if donation is None or donation.payment_method != "paypal":
        return jsonify({"message": "PayPal donation not found."}), 404
    if donation.provider_reference != payload.get("order_id"):
        return jsonify({"message": "PayPal order does not match the donation."}), 400
    try:
        completed = capture_paypal_order(donation.provider_reference)
    except PaymentProviderError as error:
        return jsonify({"message": str(error)}), 502
    donation.payment_status = "completed" if completed else "failed"
    if donation.payment_status == "completed":
        notify_donation_completed(donation)
    db.session.commit()
    return jsonify({"donation": serialize_donation(donation)}), 200


@donations_bp.route("/mine", methods=["GET"])
def list_my_donations():
    verify_jwt_in_request()
    identity = get_jwt_identity()
    user = db.session.get(User, int(identity))
    if user is None:
        return jsonify({"message": "Authenticated user was not found."}), 401
    donor = Donor.query.filter_by(user_id=user.user_id).first()
    donations = [] if donor is None else FinancialDonation.query.filter_by(donor_id=donor.id).all()
    return jsonify({"donations": [serialize_donation(donation) for donation in donations]}), 200


@donations_bp.route("", methods=["GET"])
def list_donations():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    program_id = request.args.get("program_id", type=int)

    query = FinancialDonation.query

    if program_id:
        query = query.filter_by(program_id=program_id)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "donations": [serialize_donation(donation) for donation in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@donations_bp.route("/<int:donation_id>", methods=["GET"])
def get_donation(donation_id):
    donation = db.get_or_404(FinancialDonation, donation_id)
    return jsonify(serialize_donation(donation)), 200


@donations_bp.route("/<int:program_id>/total", methods=["GET"])
def get_program_donation_total(program_id):
    total = (
        db.session.query(func.sum(FinancialDonation.amount))
        .filter(FinancialDonation.program_id == program_id)
        .scalar()
    )
    return jsonify(
        {"program_id": program_id, "total_donations": float(total or 0)}
    ), 200
