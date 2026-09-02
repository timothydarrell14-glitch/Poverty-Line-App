from extensions import db

class AdminMessages(db.Model):
    __tablename__ = 'admin_messages'

    message_id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey("direct_chats.chat_id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("admins.admin_id"), nullable=False)
    content = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    admin = db.relationship("Admin", back_populates="messages")