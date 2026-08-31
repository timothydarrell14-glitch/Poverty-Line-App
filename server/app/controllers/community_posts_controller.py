from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.community_posts import CommunityPost
from app.schemas.community_post_schema import (
    community_post_schema,
    community_posts_schema,
    community_post_create_schema,
    community_post_update_schema,
)

community_posts_bp = Blueprint(
    "community_posts", __name__, url_prefix="/api/community-posts"
)


@community_posts_bp.route("", methods=["POST"])
@jwt_required()
def create_community_post():
    current_user_id = int(get_jwt_identity())

    try:
        data = community_post_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    post = CommunityPost(
        community_id=data["community_id"],
        user_id=current_user_id,
        content=data["content"],
    )
    db.session.add(post)
    db.session.commit()

    return jsonify(community_post_schema.dump(post)), 201


@community_posts_bp.route("", methods=["GET"])
def list_community_posts():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    community_id = request.args.get("community_id", type=int)

    query = CommunityPost.query

    if community_id:
        query = query.filter_by(community_id=community_id)

    pagination = query.order_by(CommunityPost.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "posts": community_posts_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@community_posts_bp.route("/<int:post_id>", methods=["GET"])
def get_community_post(post_id):
    post = db.get_or_404(CommunityPost, post_id)
    return jsonify(community_post_schema.dump(post)), 200


@community_posts_bp.route("/<int:post_id>", methods=["PATCH"])
@jwt_required()
def update_community_post(post_id):
    current_user_id = int(get_jwt_identity())
    post = db.get_or_404(CommunityPost, post_id)

    if post.user_id != current_user_id:
        return jsonify({"error": "Not authorized to edit this post"}), 403

    try:
        data = community_post_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    post.content = data["content"]
    db.session.commit()

    return jsonify(community_post_schema.dump(post)), 200


@community_posts_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_community_post(post_id):
    current_user_id = int(get_jwt_identity())
    post = db.get_or_404(CommunityPost, post_id)

    if post.user_id != current_user_id:
        return jsonify({"error": "Not authorized to delete this post"}), 403

    db.session.delete(post)
    db.session.commit()

    return "", 204
