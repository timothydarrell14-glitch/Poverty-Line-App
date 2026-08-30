from flask import Blueprint, request, jsonify
from app.models.users import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.organisations import Organisation
from app.schemas.organisation_schema import (
	organisation_schema,
	organisations_schema,
	organisation_create_schema,
	organisation_update_schema,
)

organisations_bp = Blueprint("organisations", __name__, url_prefix="/organisations")


@organisations_bp.route("", methods=["POST"])
@jwt_required()
def create_organisation():
	current_user_id = int(get_jwt_identity())

	try:
		data = organisation_create_schema.load(request.get_json())
	except ValidationError as err:
		return jsonify(err.messages), 422

	organisation = Organisation(
		owner_user_id=current_user_id,
		name=data["name"],
		organisation_type=data.get("organisation_type"),
		description=data.get("description"),
		email=data["email"],
		phone=data.get("phone"),
		website=data.get("website"),
		location=data.get("location"),
		verified=False,
	)
	db.session.add(organisation)
	db.session.commit()

	return jsonify(organisation_schema.dump(organisation)), 201


@organisations_bp.route("", methods=["GET"])
def list_organisations():
	page = request.args.get("page", 1, type=int)
	per_page = request.args.get("per_page", 20, type=int)
	search = request.args.get("search")
	organisation_type = request.args.get("organisation_type")
	location = request.args.get("location")
	verified = request.args.get("verified")

	query = Organisation.query

	if search:
		like = f"%{search}%"
		query = query.filter(
			(Organisation.name.ilike(like)) | (Organisation.description.ilike(like))
		)
	if organisation_type:
		query = query.filter_by(organisation_type=organisation_type)
	if location:
		query = query.filter(Organisation.location.ilike(f"%{location}%"))
	if verified is not None:
		query = query.filter_by(verified=verified.lower() == "true")

	pagination = query.paginate(page=page, per_page=per_page, error_out=False)

	return jsonify(
		{
			"organisations": organisations_schema.dump(pagination.items),
			"total": pagination.total,
			"page": pagination.page,
			"per_page": pagination.per_page,
			"pages": pagination.pages,
		}
	), 200


@organisations_bp.route("/<int:organisation_id>", methods=["GET"])
def get_organisation(organisation_id):
	organisation = Organisation.query.get_or_404(organisation_id)
	return jsonify(organisation_schema.dump(organisation)), 200


@organisations_bp.route("/<int:organisation_id>", methods=["PATCH"])
@jwt_required()
def update_organisation(organisation_id):
	current_user_id = int(get_jwt_identity())
	organisation = Organisation.query.get_or_404(organisation_id)

	if organisation.owner_user_id != current_user_id:
		return jsonify({"error": "Not authorized to update this organisation"}), 403

	try:
		data = organisation_update_schema.load(request.get_json())
	except ValidationError as err:
		return jsonify(err.messages), 422

	for key, value in data.items():
		setattr(organisation, key, value)

	db.session.commit()
	return jsonify(organisation_schema.dump(organisation)), 200


@organisations_bp.route("/<int:organisation_id>", methods=["DELETE"])
@jwt_required()
def delete_organisation(organisation_id):
	current_user_id = int(get_jwt_identity())
	organisation = Organisation.query.get_or_404(organisation_id)

	if organisation.owner_user_id != current_user_id:
		return jsonify({"error": "Not authorized to delete this organisation"}), 403

	db.session.delete(organisation)
	db.session.commit()
	return "", 204



@organisations_bp.route("/<int:organisation_id>/verify", methods=["PATCH"])
@jwt_required()
def verify_organisation(organisation_id):
	current_user_id = int(get_jwt_identity())
	current_user = User.query.get_or_404(current_user_id)

	if current_user.role != "admin":
		return jsonify({"error": "Admin access required"}), 403

	organisation = Organisation.query.get_or_404(organisation_id)
	organisation.verified = True
	db.session.commit()

	return jsonify(organisation_schema.dump(organisation)), 200