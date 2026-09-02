from extensions import db

class GroupChats(db.Model):
    __tablename__ = 'group_chats'

    groupchat_id = db.Column(db.Integer, primary_key=True)
    group_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    users = db.relationship("User", secondary="group_chat_members", back_populates="group_chats")