from app.extensions import db


class Chat(db.Model):
    __tablename__ = "chats"

    chat_id = db.Column(db.Integer, primary_key=True)
    contact_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(100), nullable=False, default="Partner")
    last_message = db.Column(db.Text, nullable=False, default="")
    status = db.Column(db.String(100), nullable=False, default="Active now")
    unread_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now(), onupdate=db.func.now())
