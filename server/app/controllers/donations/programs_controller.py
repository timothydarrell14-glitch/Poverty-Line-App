from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.donations.programs import Program
from app.models.users.organisations import Organisation
from app.routes.authorization import admin_required
from app.schemas.donations.program_schema import (
    program_schema,
    programs_schema,
    program_create_schema,
    program_update_schema,
)

programs_bp = Blueprint("programs", __name__, url_prefix="/api/programs")


@programs_bp.route("/admin", methods=["GET"])
@admin_required
def admin_list_programs():
    """List programs for the admin frontend with pagination and filters."""
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 20, type=int), 1), 100)
    pagination = Program.list_for_admin(
        search=request.args.get("search"),
        status=request.args.get("status"),
        organisation_id=request.args.get("organisation_id", type=int),
    ).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify(
        {
            "programs": programs_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@programs_bp.route("/admin", methods=["POST"])
@admin_required
def admin_create_program():
    """Create a program after confirming its selected organisation exists."""
    try:
        data = program_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422
    if db.session.get(Organisation, data["organisation_id"]) is None:
        return jsonify({"message": "Organisation not found."}), 404
    program = Program.create_from_data(data)
    db.session.add(program)
    db.session.commit()
    return jsonify(program_schema.dump(program)), 201


@programs_bp.route("/admin/<int:program_id>", methods=["GET", "PATCH", "DELETE"])
@admin_required
def admin_manage_program(program_id):
    """Update or delete a program from the administrator frontend."""
    program = db.session.get(Program, program_id)
    if program is None:
        return jsonify({"message": "Program not found."}), 404
    if request.method == "GET":
        return jsonify(program_schema.dump(program)), 200
    if request.method == "DELETE":
        db.session.delete(program)
        db.session.commit()
        return "", 204
    try:
        data = program_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422
    for key, value in data.items():
        setattr(program, key, value)
    db.session.commit()
    return jsonify(program_schema.dump(program)), 200


@programs_bp.route("", methods=["POST"])
@jwt_required()
def create_program():
    try:
        data = program_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    program = Program(
        organisation_id=data["organisation_id"],
        name=data["name"],
        description=data.get("description"),
        category=data.get("category"),
        location=data.get("location"),
        eligibility=data.get("eligibility"),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        status="active",
    )
    db.session.add(program)
    db.session.commit()

    return jsonify(program_schema.dump(program)), 201


@programs_bp.route("", methods=["GET"])
def list_programs():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search")
    status = request.args.get("status")
    category = request.args.get("category")
    organisation_id = request.args.get("organisation_id", type=int)

    query = Program.query

    if search:
        like = f"%{search}%"
        query = query.filter(
            (Program.name.ilike(like)) | (Program.description.ilike(like))
        )
    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)
    if organisation_id:
        query = query.filter_by(organisation_id=organisation_id)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "programs": programs_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@programs_bp.route("/<int:program_id>", methods=["GET"])
def get_program(program_id):
    program = db.get_or_404(Program, program_id)
    return jsonify(program_schema.dump(program)), 200


@programs_bp.route("/<int:program_id>", methods=["PATCH"])
@jwt_required()
def update_program(program_id):
    program = db.get_or_404(Program, program_id)

    try:
        data = program_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    for key, value in data.items():
        setattr(program, key, value)

    db.session.commit()
    return jsonify(program_schema.dump(program)), 200


@programs_bp.route("/<int:program_id>", methods=["DELETE"])
@jwt_required()
def delete_program(program_id):
    program = db.get_or_404(Program, program_id)
    db.session.delete(program)
    db.session.commit()
    return "", 204
