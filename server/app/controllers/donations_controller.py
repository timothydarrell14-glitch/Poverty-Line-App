from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from sqlalchemy import func

from app.extensions import db
from app.models.donations import Donation
from app.schemas.donation_schema import (
    donation_schema,
    donations_schema,
    donation_create_schema,
)

donations_bp = Blueprint("donations", __name__, url_prefix="/donations")


@donations_bp.route("", methods=["POST"])
@jwt_required()
def create_donation():
    try:
        data = donation_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    donation = Donation(
        program_id=data["program_id"],
        donor_name=data.get("donor_name"),
        donor_type=data.get("donor_type"),
        amount=data["amount"],
        currency=data.get("currency"),
        donation_date=data.get("donation_date"),
        payment_method=data.get("payment_method"),
        anonymous=data.get("anonymous", False),
        transaction_reference=data.get("transaction_reference"),
    )
    db.session.add(donation)
    db.session.commit()

    return jsonify(donation_schema.dump(donation)), 201


@donations_bp.route("", methods=["GET"])
def list_donations():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    program_id = request.args.get("program_id", type=int)

    query = Donation.query

    if program_id:
        query = query.filter_by(program_id=program_id)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "donations": donations_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@donations_bp.route("/<int:donation_id>", methods=["GET"])
def get_donation(donation_id):
    donation = db.get_or_404(Donation, donation_id)
    return jsonify(donation_schema.dump(donation)), 200


@donations_bp.route("/<int:program_id>/total", methods=["GET"])
def get_program_donation_total(program_id):
    total = (
        db.session.query(func.sum(Donation.amount))
        .filter(Donation.program_id == program_id)
        .scalar()
    )
    return jsonify(
        {"program_id": program_id, "total_donations": float(total or 0)}
    ), 200
