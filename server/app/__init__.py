import os
from pathlib import Path

from flask import Flask, jsonify
from dotenv import load_dotenv

from app.extensions import cors, db, jwt, ma, migrate
import app.models

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


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

    @app.route("/")
    def home():
        return jsonify({"message": "Welcome to the BACKEND API!"})

    from app.routes.auth_routes import auth_bp

    app.register_blueprint(auth_bp)

    @app.cli.command("seed-admin")
    def seed_admin():
        """Create the initial administrator from ADMIN_* environment variables."""
        from werkzeug.security import generate_password_hash

        from app.models.users import User

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
