from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.users import User
from app.schemas.user_schema import user_schema, user_register_schema

users_bp = Blueprint("users", __name__, url_prefix="/users")


@users_bp.route("/register", methods=["POST"])
def register():
	try:
		data = user_register_schema.load(request.get_json())
	except ValidationError as err:
		return jsonify(err.messages), 422

	if User.query.filter_by(email=data["email"]).first():
		return jsonify({"error": "Email already registered"}), 409

	user = User(
		first_name=data["first_name"],
		last_name=data["last_name"],
		email=data["email"],
		password_hash=generate_password_hash(data["password"]),
		phone=data.get("phone"),
		date_of_birth=data.get("date_of_birth"),
		gender=data.get("gender"),
		education_level=data.get("education_level"),
		employment_status=data.get("employment_status"),
		skills=data.get("skills"),
		location=data.get("location"),
	)
	db.session.add(user)
	db.session.commit()

	return jsonify(user_schema.dump(user)), 201


@users_bp.route("/login", methods=["POST"])
def login():
	data = request.get_json() or {}
	email = data.get("email")
	password = data.get("password")

	if not email or not password:
		return jsonify({"error": "Email and password required"}), 400

	user = User.query.filter_by(email=email).first()
	if not user or not check_password_hash(user.password_hash, password):
		return jsonify({"error": "Invalid credentials"}), 401

	access_token = create_access_token(identity=str(user.user_id))
	return jsonify({"access_token": access_token, "user": user_schema.dump(user)}), 200