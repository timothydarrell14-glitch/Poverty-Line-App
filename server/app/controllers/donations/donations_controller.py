from flask import Blueprint, request, jsonify
from datetime import date
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
    initiate_payment,
)

donations_bp = Blueprint("donations", __name__, url_prefix="/api/donations")


def normalize_kenyan_mobile(phone):
    normalized = re.sub(r"[\s-]", "", phone or "")
    if normalized.startswith("0"):
        normalized = "+254" + normalized[1:]
    return normalized if re.fullmatch(r"\+254[17]\d{8}", normalized) else None


def serialize_donation(donation):
    payload = donation_schema.dump(donation)
    payload["program_title"] = donation.program.title if donation.program else "General Community Fund"
    return payload


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
    callback = (request.get_json(silent=True) or {}).get("Body", {}).get("stkCallback", {})
    provider_reference = callback.get("CheckoutRequestID")
    donation = FinancialDonation.query.filter_by(provider_reference=provider_reference).first()
    if donation is None:
        return jsonify({"message": "Donation not found."}), 404

    result_code = callback.get("ResultCode")
    donation.payment_status = "completed" if result_code == 0 else "failed"
    for item in callback.get("CallbackMetadata", {}).get("Item", []):
        if item.get("Name") == "MpesaReceiptNumber":
            donation.transaction_code = str(item.get("Value"))
            break
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
