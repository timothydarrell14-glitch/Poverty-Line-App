from app.extensions import db
from werkzeug.security import check_password_hash, generate_password_hash


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

	def is_admin(self):
		"""Return whether this user currently has administrator access."""
		return (self.role or "").strip().lower() == "admin"

	@classmethod
	def get_by_email(cls, email):
		"""Find a user by an email address without case sensitivity."""
		return cls.query.filter(db.func.lower(cls.email) == email.strip().lower()).first()

	@classmethod
	def create_from_registration(cls, data):
		"""Build a standard-user account from validated registration data."""
		return cls(
			first_name=data["first_name"],
			last_name=data["last_name"],
			email=data["email"].strip().lower(),
			password_hash=generate_password_hash(data["password"]),
			phone=data.get("phone"),
			date_of_birth=data.get("date_of_birth"),
			gender=data.get("gender"),
			education_level=data.get("education_level"),
			employment_status=data.get("employment_status"),
			skills=data.get("skills"),
			location=data.get("location"),
			role="user",
		)

	def verifies_password(self, password):
		"""Safely check a plaintext password against the stored hash."""
		return check_password_hash(self.password_hash, password)

	@classmethod
	def list_for_admin(cls, search=None, role=None):
		"""Build a filtered user query for administrator management tools."""
		query = cls.query
		if search:
			term = f"%{search.strip()}%"
			query = query.filter(
				db.or_(cls.first_name.ilike(term), cls.last_name.ilike(term), cls.email.ilike(term))
			)
		if role:
			query = query.filter(db.func.lower(cls.role) == role.strip().lower())
		return query.order_by(cls.created_at.desc(), cls.user_id.desc())
