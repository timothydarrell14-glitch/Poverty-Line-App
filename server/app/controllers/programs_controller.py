from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.programs import Program
from app.schemas.program_schema import (
	program_schema,
	programs_schema,
	program_create_schema,
	program_update_schema,
)

programs_bp = Blueprint("programs", __name__, url_prefix="/programs")


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
	program = Program.query.get_or_404(program_id)
	return jsonify(program_schema.dump(program)), 200


@programs_bp.route("/<int:program_id>", methods=["PATCH"])
@jwt_required()
def update_program(program_id):
	program = Program.query.get_or_404(program_id)

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
	program = Program.query.get_or_404(program_id)
	db.session.delete(program)
	db.session.commit()
	return "", 204