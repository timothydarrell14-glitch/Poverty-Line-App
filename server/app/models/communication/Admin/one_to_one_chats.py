from app.extensions import db

class DirectChats(db.Model):
    __tablename__ = 'direct_chats'

    chat_id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user1 = db.relationship("User", foreign_keys=[user1_id])
    user2 = db.relationship("User", foreign_keys=[user2_id])