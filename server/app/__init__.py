import os
from pathlib import Path

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv

from app.extensions import cors, db, jwt, ma, migrate
from app.models import *  # noqa: F401
from app.routes.callbacks import callback_bp

# Load .env.local first (if it exists) to override .env
env_path = Path(__file__).resolve().parents[1] / ".env"
env_local = Path(__file__).resolve().parents[1] / ".env.local"
# Load .env first
load_dotenv(env_path)
# Then load .env.local which overrides keys from .env
if env_local.exists():
    load_dotenv(env_local, override=True)


def create_app():
    """Application factory function to instantiate the Flask app."""
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "development-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///poverty_line_app.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "development-jwt-secret-key"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(
        os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 86400)
    )

    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)

    allowed_origins = []
    frontend_origins = os.environ.get("CORS_ORIGINS") or os.environ.get(
        "FRONTEND_URL", "http://localhost:5173"
    )
    for origin in str(frontend_origins).split(","):
        cleaned = origin.strip()
        if cleaned:
            allowed_origins.append(cleaned)

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
            }
        },
    )
    jwt.init_app(app)

    @jwt.unauthorized_loader
    def missing_access_token(reason):
        return jsonify(
            {"message": "Authentication is required.", "details": reason}
        ), 401

    @jwt.invalid_token_loader
    def invalid_access_token(reason):
        return jsonify(
            {"message": "The access token is invalid.", "details": reason}
        ), 401

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

    from app.routes.auth_routes import auth_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(callback_bp)

    from app.controllers.classification.assessment_questions_controller import assessment_questions_bp
    from app.controllers.classification.assessment_responses_controller import assessment_responses_bp
    from app.controllers.communication.communities_controller import communities_bp
    from app.controllers.communication.community_memberships_controller import (
        community_memberships_bp,
    )
    from app.controllers.communication.community_posts_controller import community_posts_bp
    from app.controllers.donations.donations_controller import donations_bp
    from app.controllers.job_applications_controller import job_applications_bp
    from app.controllers.jobs_controller import jobs_bp
    from app.controllers.users.organisations_controller import organisations_bp
    from app.controllers.donations.programs_controller import programs_bp
    from app.routes.users import users_bp
    from app.controllers.countries_controller import countries_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(callback_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(job_applications_bp)
    app.register_blueprint(programs_bp)
    app.register_blueprint(donations_bp)
    app.register_blueprint(countries_bp)
    app.register_blueprint(countries_bp)
    app.register_blueprint(communities_bp)
    app.register_blueprint(community_memberships_bp)
    app.register_blueprint(community_posts_bp)
    app.register_blueprint(assessment_questions_bp)
    app.register_blueprint(assessment_responses_bp)
    app.register_blueprint(organisations_bp)

    @app.cli.command("seed-admin")
    def seed_admin():
        """Create the initial administrator from ADMIN_* environment variables."""
        from werkzeug.security import generate_password_hash

        from app.models.users.users import User

        first_name = os.environ.get("ADMIN_FIRST_NAME", "Admin").strip()
        last_name = os.environ.get("ADMIN_LAST_NAME", "User").strip()
        email = os.environ.get("ADMIN_EMAIL", "admin@example.com").strip().lower()
        password = os.environ.get("ADMIN_PASSWORD", "ChangeMe123!")

        if User.query.filter_by(email=email).first():
            print("An account with that email already exists.")
            return

        admin = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=generate_password_hash(password),
            role="admin",
            is_active=True,
        )
        db.session.add(admin)
        db.session.commit()
        print(f"Created admin {email}.")

    @app.cli.command("create-admin")
    def create_admin():
        """Alias for seed-admin for explicit bootstrap workflows."""
        seed_admin()

    return app
