from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.users import User
from app.schemas.user_schema import (
	user_schema,
	users_schema,
	user_register_schema,
	user_update_schema,
)

users_bp = Blueprint("users", __name__, url_prefix="/users")


@users_bp.route("/register", methods=["POST"])
def register():
	try:
		data = user_register_schema.load(request.get_json())
	except ValidationError as err:
		return jsonify(err.messages), 422

	if User.get_by_email(data["email"]):
		return jsonify({"error": "Email already registered"}), 409

	user = User.create_from_registration(data)
	db.session.add(user)
	db.session.commit()

	return jsonify(user_schema.dump(user)), 201


@users_bp.route("/login", methods=["POST"])
def login():
	data = request.get_json() or {}
	email = data.get("email", "").strip()
	password = data.get("password")

	if not email or not password:
		return jsonify({"error": "Email and password required"}), 400

	user = User.get_by_email(email) if email else None
	if not user or not user.verifies_password(password):
		return jsonify({"error": "Invalid credentials"}), 401

	access_token = create_access_token(identity=str(user.user_id))
	return jsonify({"access_token": access_token, "user": user_schema.dump(user)}), 200


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def current_user():
	"""Return the database account represented by the supplied access token."""
	user = db.session.get(User, int(get_jwt_identity()))
	if user is None:
		return jsonify({"message": "Authenticated user was not found."}), 401
	return jsonify(user.to_dict()), 200


@users_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
	"""Provide a logout endpoint; the client clears its bearer token locally."""
	return jsonify({"message": "Signed out successfully."}), 200


@users_bp.route("", methods=["GET"])
def list_users():
	page = request.args.get("page", 1, type=int)
	per_page = request.args.get("per_page", 20, type=int)
	search = request.args.get("search")
	location = request.args.get("location")
	education_level = request.args.get("education_level")
	poverty_classification = request.args.get("poverty_classification")

	query = User.query

	if search:
		like = f"%{search}%"
		query = query.filter(
			(User.first_name.ilike(like))
			| (User.last_name.ilike(like))
			| (User.email.ilike(like))
		)
	if location:
		query = query.filter(User.location.ilike(f"%{location}%"))
	if education_level:
		query = query.filter_by(education_level=education_level)
	if poverty_classification:
		query = query.filter_by(poverty_classification=poverty_classification)

	pagination = query.paginate(page=page, per_page=per_page, error_out=False)

	return jsonify(
		{
			"users": users_schema.dump(pagination.items),
			"total": pagination.total,
			"page": pagination.page,
			"per_page": pagination.per_page,
			"pages": pagination.pages,
		}
	), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
	user = User.query.get_or_404(user_id)
	return jsonify(user_schema.dump(user)), 200


@users_bp.route("/<int:user_id>", methods=["PATCH"])
@jwt_required()
def update_user(user_id):
	current_user_id = int(get_jwt_identity())
	if current_user_id != user_id:
		return jsonify({"error": "Not authorized to update this user"}), 403

	user = User.query.get_or_404(user_id)

	try:
		data = user_update_schema.load(request.get_json())
	except ValidationError as err:
		return jsonify(err.messages), 422

	for key, value in data.items():
		setattr(user, key, value)

	db.session.commit()
	return jsonify(user_schema.dump(user)), 200


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
	current_user_id = int(get_jwt_identity())
	if current_user_id != user_id:
		return jsonify({"error": "Not authorized to delete this user"}), 403

	user = User.query.get_or_404(user_id)
	db.session.delete(user)
	db.session.commit()
	return "", 204
