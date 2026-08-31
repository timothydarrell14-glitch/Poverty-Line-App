from app.extensions import db


class AppSetting(db.Model):
    __tablename__ = "app_settings"

    setting_id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(255), nullable=False, unique=True)
    value = db.Column(db.Text)
    category = db.Column(db.String(100), nullable=False, default="general")
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )
