from app.extensions import db


class User(db.Model):
	__tablename__ = "users"

	user_id = db.Column(db.Integer, primary_key=True)
	first_name = db.Column(db.String(100), nullable=False)
	last_name = db.Column(db.String(100), nullable=False)
	email = db.Column(db.String(255), nullable=False, unique=True)
	password_hash = db.Column(db.String(255), nullable=False)
	role = db.Column(db.String(50), nullable=False, default="user", server_default="user")
	is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.true())
	phone = db.Column(db.String(50))
	date_of_birth = db.Column(db.Date)
	gender = db.Column(db.String(50))
	education_level = db.Column(db.String(100), nullable=True)
	employment_status = db.Column(db.String(100), nullable=True)
	skills = db.Column(db.Text, nullable=True)
	poverty_classification = db.Column(db.String(50), nullable=True)
	poverty_score = db.Column(db.Numeric(10, 2), nullable=True)
	location = db.Column(db.String(255))
	avatar_url = db.Column(db.String(500))
	created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())


	assessment_responses = db.relationship("AssessmentResponse", back_populates="user")
	program_memberships = db.relationship("ProgramMembership", back_populates="user")
	job_applications = db.relationship("JobApplication", back_populates="user")
	community_posts = db.relationship("CommunityPost", back_populates="user")
	community_memberships = db.relationship("CommunityMembership", back_populates="user")
