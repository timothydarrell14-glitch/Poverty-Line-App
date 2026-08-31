from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.community_membership import CommunityMembership
from app.schemas.community_membership_schema import (
    community_membership_schema,
    community_memberships_schema,
    community_membership_create_schema,
)

community_memberships_bp = Blueprint(
    "community_memberships", __name__, url_prefix="/community-memberships"
)


@community_memberships_bp.route("", methods=["POST"])
@jwt_required()
def create_community_membership():
    current_user_id = int(get_jwt_identity())

    try:
        data = community_membership_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    existing = CommunityMembership.query.filter_by(
        user_id=current_user_id, community_id=data["community_id"]
    ).first()
    if existing:
        return jsonify({"error": "You have already joined this community"}), 409

    membership = CommunityMembership(
        user_id=current_user_id,
        community_id=data["community_id"],
        role="member",
    )
    db.session.add(membership)
    db.session.commit()

    return jsonify(community_membership_schema.dump(membership)), 201


@community_memberships_bp.route("", methods=["GET"])
@jwt_required()
def list_my_community_memberships():
    current_user_id = int(get_jwt_identity())

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = CommunityMembership.query.filter_by(user_id=current_user_id).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "memberships": community_memberships_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@community_memberships_bp.route("/<int:membership_id>", methods=["GET"])
@jwt_required()
def get_community_membership(membership_id):
    current_user_id = int(get_jwt_identity())
    membership = db.get_or_404(CommunityMembership, membership_id)

    if membership.user_id != current_user_id:
        return jsonify({"error": "Not authorized to view this membership"}), 403

    return jsonify(community_membership_schema.dump(membership)), 200


@community_memberships_bp.route("/<int:membership_id>", methods=["DELETE"])
@jwt_required()
def leave_community(membership_id):
    current_user_id = int(get_jwt_identity())
    membership = db.get_or_404(CommunityMembership, membership_id)

    if membership.user_id != current_user_id:
        return jsonify({"error": "Not authorized to leave this community"}), 403

    db.session.delete(membership)
    db.session.commit()

    return "", 204
