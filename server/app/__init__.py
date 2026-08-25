import os
from flask import Flask, jsonify
from dotenv import load_dotenv

from app.extensions import db, migrate, ma, cors, jwt
import app.models

from app.routes.callbacks import callback_bp

load_dotenv()


def create_app():
    """Application factory function to instantiate the Flask app."""
    app = Flask(__name__)

    # Configure app settings
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///app.db")
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

    # Register blueprints
    from app.controllers.users_controller import users_bp
    app.register_blueprint(users_bp)
    app.register_blueprint(callback_bp)

    return app
