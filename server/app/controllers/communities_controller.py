from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.communities import Community
from app.models.community_membership import CommunityMembership
from app.models.community_posts import CommunityPost
from app.models.users import User
from app.schemas.community_schema import (
	community_schema,
	community_create_schema,
	community_update_schema,
)

communities_bp = Blueprint("communities", __name__, url_prefix="/api/communities")


def _get_current_user_id():
	try:
		identity = get_jwt_identity()
		if identity is not None:
			return int(identity)
	except Exception:
		pass
	# Fallback to default user if unauthenticated in demo mode
	user = User.query.first()
	if not user:
		user = User(
			first_name="Demo",
			last_name="User",
			email="demo@example.com",
			password_hash="demo_hash",
		)
		db.session.add(user)
		db.session.commit()
	return user.user_id


@communities_bp.route("", methods=["POST"])
@jwt_required(optional=True)
def create_community():
	payload = request.get_json() or {}
	try:
		data = community_create_schema.load(payload)
	except ValidationError as err:
		return jsonify(err.messages), 422

	current_user_id = _get_current_user_id()

	try:
		# 1. Initialize Community record
		community = Community(
			name=data["name"],
			description=data.get("description", ""),
			category=data.get("category", "General Support"),
			location=data.get("location", ""),
		)
		db.session.add(community)

		# 2. Flush session to obtain new community_id without committing transaction
		db.session.flush()

		# 3. Create administrator membership for the creator
		membership = CommunityMembership(
			user_id=current_user_id,
			community_id=community.community_id,
			role="admin",
		)
		db.session.add(membership)

		# 4. Atomically commit both records
		db.session.commit()

		res_data = community_schema.dump(community)
		res_data["member_count"] = 1
		res_data["post_count"] = 0
		return jsonify(res_data), 201
	except Exception as err:
		db.session.rollback()
		return jsonify({"error": "Failed to create channel", "details": str(err)}), 400


@communities_bp.route("", methods=["GET"])
def list_communities():
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

	communities = query.order_by(Community.created_at.asc()).all()

	result = []
	for c in communities:
		member_count = CommunityMembership.query.filter_by(community_id=c.community_id).count()
		post_count = CommunityPost.query.filter_by(community_id=c.community_id).count()
		item = community_schema.dump(c)
		item["member_count"] = member_count
		item["post_count"] = post_count
		result.append(item)

	return jsonify({"communities": result, "total": len(result)}), 200


@communities_bp.route("/<int:community_id>", methods=["GET"])
def get_community(community_id):
	community = Community.query.get_or_404(community_id)

	# Fetch member count and moderators
	memberships = CommunityMembership.query.filter_by(community_id=community_id).all()
	member_count = len(memberships)

	moderators = []
	avatar_previews = []

	for m in memberships:
		if m.user:
			display_name = f"{m.user.first_name} {m.user.last_name}"
			avatar = m.user.avatar_url or f"https://i.pravatar.cc/150?u={m.user.user_id}"
			if len(avatar_previews) < 5:
				avatar_previews.append({
					"user_id": m.user.user_id,
					"name": display_name,
					"avatar_url": avatar
				})
			if m.role in ["admin", "moderator"]:
				moderators.append({
					"user_id": m.user.user_id,
					"name": display_name,
					"role": m.role
				})

	data = community_schema.dump(community)
	data["member_count"] = member_count
	data["moderators"] = moderators
	data["avatar_previews"] = avatar_previews
	return jsonify(data), 200


@communities_bp.route("/<int:community_id>/posts", methods=["GET"])
def list_community_channel_posts(community_id):
	Community.query.get_or_404(community_id)

	# Optimized query with joinedload to avoid N+1 query overhead
	posts = (
		CommunityPost.query.options(joinedload(CommunityPost.user))
		.filter_by(community_id=community_id)
		.order_by(CommunityPost.created_at.asc())
		.all()
	)

	result = []
	for p in posts:
		user = p.user
		first_name = user.first_name if user else "Anonymous"
		last_name = user.last_name if user else ""
		avatar = (
			user.avatar_url
			if (user and user.avatar_url)
			else f"https://i.pravatar.cc/150?u={p.user_id}"
		)

		result.append({
			"post_id": p.post_id,
			"community_id": p.community_id,
			"user_id": p.user_id,
			"content": p.content,
			"created_at": p.created_at.isoformat() if p.created_at else None,
			"user": {
				"user_id": p.user_id,
				"first_name": first_name,
				"last_name": last_name,
				"display_name": f"{first_name} {last_name}".strip(),
				"avatar_url": avatar,
			},
		})

	return jsonify({"posts": result, "total": len(result)}), 200


@communities_bp.route("/<int:community_id>/posts", methods=["POST"])
@jwt_required(optional=True)
def create_channel_post(community_id):
	Community.query.get_or_404(community_id)
	payload = request.get_json() or {}
	content = payload.get("content", "").strip()

	if not content:
		return jsonify({"error": "Content is required"}), 422

	current_user_id = _get_current_user_id()

	post = CommunityPost(
		community_id=community_id,
		user_id=current_user_id,
		content=content,
	)
	db.session.add(post)
	db.session.commit()

	# Re-query with user details
	post = (
		CommunityPost.query.options(joinedload(CommunityPost.user))
		.filter_by(post_id=post.post_id)
		.first()
	)

	user = post.user
	first_name = user.first_name if user else "Anonymous"
	last_name = user.last_name if user else ""
	avatar = (
		user.avatar_url
		if (user and user.avatar_url)
		else f"https://i.pravatar.cc/150?u={post.user_id}"
	)

	return jsonify({
		"post_id": post.post_id,
		"community_id": post.community_id,
		"user_id": post.user_id,
		"content": post.content,
		"created_at": post.created_at.isoformat() if post.created_at else None,
		"user": {
			"user_id": post.user_id,
			"first_name": first_name,
			"last_name": last_name,
			"display_name": f"{first_name} {last_name}".strip(),
			"avatar_url": avatar,
		},
	}), 201


@communities_bp.route("/<int:community_id>/join", methods=["POST"])
@jwt_required(optional=True)
def join_community_channel(community_id):
	Community.query.get_or_404(community_id)
	current_user_id = _get_current_user_id()

	existing = CommunityMembership.query.filter_by(
		user_id=current_user_id, community_id=community_id
	).first()

	if existing:
		return jsonify({"message": "Already a member", "membership_id": existing.membership_id}), 200

	membership = CommunityMembership(
		user_id=current_user_id,
		community_id=community_id,
		role="member",
	)
	db.session.add(membership)
	db.session.commit()

	return jsonify({
		"message": "Enrolled successfully",
		"membership_id": membership.membership_id,
		"role": membership.role
	}), 201


@communities_bp.route("/<int:community_id>", methods=["PATCH"])
@jwt_required(optional=True)
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
@jwt_required(optional=True)
def delete_community(community_id):
	community = Community.query.get_or_404(community_id)
	db.session.delete(community)
	db.session.commit()
	return "", 204
