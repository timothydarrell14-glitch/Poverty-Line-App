from app.extensions import db


class User(db.Model):
	__tablename__ = "users"

	user_id = db.Column(db.Integer, primary_key=True)
	first_name = db.Column(db.String(100), nullable=False)
	last_name = db.Column(db.String(100), nullable=False)
	email = db.Column(db.String(255), nullable=False, unique=True)
	password_hash = db.Column(db.String(255), nullable=False)
	is_admin = db.Column(db.Boolean, nullable=False, default=False, server_default=db.false())
	phone = db.Column(db.String(50))
	date_of_birth = db.Column(db.Date)
	gender = db.Column(db.String(50))
	education_level = db.Column(db.String(100))
	employment_status = db.Column(db.String(100))
	skills = db.Column(db.Text)
	poverty_classification = db.Column(db.String(50))
	poverty_score = db.Column(db.Numeric(10, 2))
	location = db.Column(db.String(255))
	created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

	assessment_responses = db.relationship("AssessmentResponse", back_populates="user")
	program_memberships = db.relationship("ProgramMembership", back_populates="user")
	job_applications = db.relationship("JobApplication", back_populates="user")
	community_posts = db.relationship("CommunityPost", back_populates="user")
	community_memberships = db.relationship("CommunityMembership", back_populates="user")
