from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.users.organisations import Organisation
from app.routes.authorization import admin_required, get_authenticated_user
from server.app.schemas.users.organisation_schema import (
    organisation_schema,
    organisations_schema,
    organisation_create_schema,
    organisation_update_schema,
)

organisations_bp = Blueprint("organisations", __name__, url_prefix="/api/organisations")


@organisations_bp.route("/admin", methods=["GET"])
@admin_required
def admin_list_organisations():
    """List organisations for admin program selection and management."""
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 50, type=int), 1), 100)
    verified = request.args.get("verified")
    if verified is not None and verified.lower() not in {"true", "false"}:
        return jsonify({"message": "verified must be true or false."}), 422
    pagination = Organisation.list_for_admin(
        request.args.get("search"),
        None if verified is None else verified.lower() == "true",
    ).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify(
        {
            "organisations": organisations_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@organisations_bp.route("/admin", methods=["POST"])
@admin_required
def admin_create_organisation():
    """Create an organisation owned by the authenticated administrator."""
    try:
        data = organisation_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422
    organisation = Organisation.create_from_data(data, get_authenticated_user().user_id)
    db.session.add(organisation)
    db.session.commit()
    return jsonify(organisation_schema.dump(organisation)), 201


@organisations_bp.route(
    "/admin/<int:organisation_id>", methods=["GET", "PATCH", "DELETE"]
)
@admin_required
def admin_manage_organisation(organisation_id):
    """Read, update, or delete an organisation from administrator screens."""
    organisation = db.session.get(Organisation, organisation_id)
    if organisation is None:
        return jsonify({"message": "Organisation not found."}), 404
    if request.method == "GET":
        return jsonify(organisation_schema.dump(organisation)), 200
    if request.method == "DELETE":
        db.session.delete(organisation)
        db.session.commit()
        return "", 204
    try:
        data = organisation_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422
    for key, value in data.items():
        setattr(organisation, key, value)
    db.session.commit()
    return jsonify(organisation_schema.dump(organisation)), 200


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
    organisation = db.get_or_404(Organisation, organisation_id)
    return jsonify(organisation_schema.dump(organisation)), 200


@organisations_bp.route("/<int:organisation_id>", methods=["PATCH"])
@jwt_required()
def update_organisation(organisation_id):
    current_user_id = int(get_jwt_identity())
    organisation = db.get_or_404(Organisation, organisation_id)

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
    organisation = db.get_or_404(Organisation, organisation_id)

    if organisation.owner_user_id != current_user_id:
        return jsonify({"error": "Not authorized to delete this organisation"}), 403

    db.session.delete(organisation)
    db.session.commit()
    return "", 204
