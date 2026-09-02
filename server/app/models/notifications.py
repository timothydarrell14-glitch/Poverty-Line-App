from app.extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"

    notification_id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False, default="")
    related_type = db.Column(db.String(50))
    related_id = db.Column(db.Integer)
    is_read = db.Column(db.Boolean, nullable=False, default=False, server_default=db.false())
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
