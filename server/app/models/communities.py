from app.extensions import db


class Community(db.Model):
	__tablename__ = "communities"

	community_id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(255), nullable=False)
	description = db.Column(db.Text)
	category = db.Column(db.String(100))
	location = db.Column(db.String(255))
	created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

	posts = db.relationship("CommunityPost", back_populates="community")
	memberships = db.relationship("CommunityMembership", back_populates="community")
