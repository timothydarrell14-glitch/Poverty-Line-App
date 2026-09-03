from app.extensions import db


class CommunityMembership(db.Model):
    __tablename__ = "community_memberships"

    membership_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    community_id = db.Column(
        db.Integer, db.ForeignKey("communities.community_id"), nullable=False
    )
    joined_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    role = db.Column(db.String(50))

    user = db.relationship("User")
    community = db.relationship("Community", back_populates="memberships")

    __table_args__ = (db.UniqueConstraint("user_id", "community_id"),)
