from flask import Flask

from app.extensions import db, ma, jwt


def create_app(config=None):
    app = Flask(__name__)

    # ========================================================
    # DEFAULT CONFIGURATION
    # ========================================================

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///poverty_line.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = (
        "change-this-secret-key-in-production"
    )

    # ========================================================
    # TESTING CONFIGURATION
    # ========================================================

    if config == "testing":
        app.config.update({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_TRACK_MODIFICATIONS": False,
            "JWT_SECRET_KEY": (
                "test-secret-key-that-is-long-enough-for-testing"
            ),
        })

    elif isinstance(config, dict):
        app.config.update(config)

    elif config is not None:
        app.config.from_object(config)

    # ========================================================
    # INITIALIZE EXTENSIONS
    # ========================================================

    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)

    # ========================================================
    # REGISTER ROUTES
    # ========================================================

    from app.routes.auth_routes import auth_bp
    from app.routes.organization_routes import organization_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(organization_bp)

    # ========================================================
    # RETURN APP
    # ========================================================

    return app