from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.donations.program_memberships import ProgramMembership
from app.schemas.donations.program_membership_schema import (
    program_membership_schema,
    program_memberships_schema,
    program_membership_create_schema,
)

program_memberships_bp = Blueprint(
    "program_memberships", __name__, url_prefix="/api/program-memberships"
)


@program_memberships_bp.route("", methods=["POST"])
@jwt_required()
def create_program_membership():
    current_user_id = int(get_jwt_identity())

    try:
        data = program_membership_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    existing = ProgramMembership.query.filter_by(
        user_id=current_user_id, program_id=data["program_id"]
    ).first()
    if existing:
        return jsonify({"error": "You have already joined this program"}), 409

    membership = ProgramMembership(
        user_id=current_user_id,
        program_id=data["program_id"],
        status="active",
    )
    db.session.add(membership)
    db.session.commit()

    return jsonify(program_membership_schema.dump(membership)), 201


@program_memberships_bp.route("", methods=["GET"])
@jwt_required()
def list_my_program_memberships():
    current_user_id = int(get_jwt_identity())

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = ProgramMembership.query.filter_by(user_id=current_user_id).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "memberships": program_memberships_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@program_memberships_bp.route("/<int:membership_id>", methods=["GET"])
@jwt_required()
def get_program_membership(membership_id):
    current_user_id = int(get_jwt_identity())
    membership = db.get_or_404(ProgramMembership, membership_id)

    if membership.user_id != current_user_id:
        return jsonify({"error": "Not authorized to view this membership"}), 403

    return jsonify(program_membership_schema.dump(membership)), 200


@program_memberships_bp.route("/<int:membership_id>", methods=["DELETE"])
@jwt_required()
def leave_program(membership_id):
    current_user_id = int(get_jwt_identity())
    membership = db.get_or_404(ProgramMembership, membership_id)

    if membership.user_id != current_user_id:
        return jsonify({"error": "Not authorized to leave this program"}), 403

    db.session.delete(membership)
    db.session.commit()

    return "", 204
