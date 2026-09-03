from app.extensions import db

group_chat_members = db.Table(
    "group_chat_members",
    db.Column("group_id", db.Integer, db.ForeignKey("group_chats.groupchat_id"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.user_id"), primary_key=True),
)

class GroupChats(db.Model):
    __tablename__ = 'group_chats'

    groupchat_id = db.Column(db.Integer, primary_key=True)
    group_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    users = db.relationship("User", secondary="group_chat_members", back_populates="group_chats")