from app.extensions import db


class CommunityPost(db.Model):
	__tablename__ = "community_posts"

	post_id = db.Column(db.Integer, primary_key=True)
	community_id = db.Column(
		db.Integer, db.ForeignKey("communities.community_id"), nullable=False
	)
	user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
	content = db.Column(db.Text, nullable=False)
	created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

	community = db.relationship("Community", back_populates="posts")
	user = db.relationship("User", back_populates="community_posts")
