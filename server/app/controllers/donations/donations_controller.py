from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from sqlalchemy import func

from app.extensions import db
from server.app.models.donations.financialDonations import FinancialDonation
from server.app.schemas.donations.donation_schema import (
    donation_schema,
    donations_schema,
    donation_create_schema,
)

donations_bp = Blueprint("donations", __name__, url_prefix="/api/donations")


@donations_bp.route("", methods=["POST"])
@jwt_required()
def create_donation():
    try:
        data = donation_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    donation = FinancialDonation(**data)
    db.session.add(donation)
    db.session.commit()

    return jsonify(donation_schema.dump(donation)), 201


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
            "donations": donations_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@donations_bp.route("/<int:donation_id>", methods=["GET"])
def get_donation(donation_id):
    donation = db.get_or_404(FinancialDonation, donation_id)
    return jsonify(donation_schema.dump(donation)), 200


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
