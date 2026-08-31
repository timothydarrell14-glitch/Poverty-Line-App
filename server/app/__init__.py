import os
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv

from app.extensions import db, migrate, ma, cors, jwt
import app.models

from app.routes.callbacks import callback_bp

load_dotenv()


def create_app():
	app = Flask(__name__)

	app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
	app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///app.db")
	app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
	app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")

	db.init_app(app)
	migrate.init_app(app, db)
	ma.init_app(app)
	cors.init_app(app)
	jwt.init_app(app)

	@jwt.unauthorized_loader
	def missing_access_token(reason):
		return jsonify({"message": "Authentication is required.", "details": reason}), 401

	@jwt.invalid_token_loader
	def invalid_access_token(reason):
		return jsonify({"message": "The access token is invalid.", "details": reason}), 401

	@jwt.expired_token_loader
	def expired_access_token(_header, _payload):
		return jsonify({"message": "The access token has expired."}), 401

	@app.errorhandler(HTTPException)
	def handle_http_error(error):
		"""Return JSON errors so frontend API callers have one response shape."""
		return jsonify({"message": error.description, "status": error.code}), error.code

	@app.route("/")
	def home():
		return jsonify({"message": "Welcome to the BACKEND API!"})

	from app.controllers.users_controller import users_bp
	app.register_blueprint(users_bp)
	app.register_blueprint(callback_bp)

	from app.controllers.jobs_controller import jobs_bp
	app.register_blueprint(jobs_bp)

	from app.controllers.job_applications_controller import job_applications_bp
	app.register_blueprint(job_applications_bp)

	from app.controllers.programs_controller import programs_bp
	app.register_blueprint(programs_bp)

	from app.controllers.program_memberships_controller import program_memberships_bp
	app.register_blueprint(program_memberships_bp)

	from app.controllers.donations_controller import donations_bp
	app.register_blueprint(donations_bp)

	from app.controllers.communities_controller import communities_bp
	app.register_blueprint(communities_bp)

	from app.controllers.community_memberships_controller import community_memberships_bp
	app.register_blueprint(community_memberships_bp)

	from app.controllers.community_posts_controller import community_posts_bp
	app.register_blueprint(community_posts_bp)

	from app.controllers.assessment_questions_controller import assessment_questions_bp
	app.register_blueprint(assessment_questions_bp)

	from app.controllers.assessment_responses_controller import assessment_responses_bp
	app.register_blueprint(assessment_responses_bp)

	from app.controllers.organisations_controller import organisations_bp
	app.register_blueprint(organisations_bp)

	return app
