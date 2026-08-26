from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.communities import Community
from app.schemas.community_schema import (
	community_schema,
	communities_schema,
	community_create_schema,
	community_update_schema,
)

communities_bp = Blueprint("communities", __name__, url_prefix="/communities")


@communities_bp.route("", methods=["POST"])
@jwt_required()
def create_community():
	try:
		data = community_create_schema.load(request.get_json())
	except ValidationError as err:
		return jsonify(err.messages), 422

	community = Community(
		name=data["name"],
		description=data.get("description"),
		category=data.get("category"),
		location=data.get("location"),
	)
	db.session.add(community)
	db.session.commit()

	return jsonify(community_schema.dump(community)), 201


@communities_bp.route("", methods=["GET"])
def list_communities():
	page = request.args.get("page", 1, type=int)
	per_page = request.args.get("per_page", 20, type=int)
	search = request.args.get("search")
	category = request.args.get("category")
	location = request.args.get("location")

	query = Community.query

	if search:
		like = f"%{search}%"
		query = query.filter(
			(Community.name.ilike(like)) | (Community.description.ilike(like))
		)
	if category:
		query = query.filter_by(category=category)
	if location:
		query = query.filter(Community.location.ilike(f"%{location}%"))

	pagination = query.paginate(page=page, per_page=per_page, error_out=False)

	return jsonify(
		{
			"communities": communities_schema.dump(pagination.items),
			"total": pagination.total,
			"page": pagination.page,
			"per_page": pagination.per_page,
			"pages": pagination.pages,
		}
	), 200


@communities_bp.route("/<int:community_id>", methods=["GET"])
def get_community(community_id):
	community = Community.query.get_or_404(community_id)
	return jsonify(community_schema.dump(community)), 200


@communities_bp.route("/<int:community_id>", methods=["PATCH"])
@jwt_required()
def update_community(community_id):
	community = Community.query.get_or_404(community_id)

	try:
		data = community_update_schema.load(request.get_json())
	except ValidationError as err:
		return jsonify(err.messages), 422

	for key, value in data.items():
		setattr(community, key, value)

	db.session.commit()
	return jsonify(community_schema.dump(community)), 200


@communities_bp.route("/<int:community_id>", methods=["DELETE"])
@jwt_required()
def delete_community(community_id):
	community = Community.query.get_or_404(community_id)
	db.session.delete(community)
	db.session.commit()
	return "", 204