import os
from pathlib import Path
from flask import Flask, jsonify
from dotenv import load_dotenv

from app.extensions import db, migrate, ma, cors, jwt
import app.models

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def create_app():
    """Application factory function to instantiate the Flask app."""
    app = Flask(__name__)

    # Configure app settings
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)

    @app.route("/")
    def home():
        return jsonify({"message": "Welcome to the BACKEND API!"})

    from app.routes.auth_routes import auth_bp

    app.register_blueprint(auth_bp)

    return app
