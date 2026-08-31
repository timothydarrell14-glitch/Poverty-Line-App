from app.extensions import db


class Program(db.Model):
	__tablename__ = "programs"

	program_id = db.Column(db.Integer, primary_key=True)
	organisation_id = db.Column(
		db.Integer, db.ForeignKey("organisations.organisation_id"), nullable=False
	)
	name = db.Column(db.String(255), nullable=False)
	description = db.Column(db.Text)
	category = db.Column(db.String(100))
	location = db.Column(db.String(255))
	eligibility = db.Column(db.Text)
	start_date = db.Column(db.Date)
	end_date = db.Column(db.Date)
	status = db.Column(db.String(50))

	organisation = db.relationship("Organisation", back_populates="programs")
	donations = db.relationship("Donation", back_populates="program")
	memberships = db.relationship("ProgramMembership", back_populates="program")

	@classmethod
	def list_for_admin(cls, search=None, status=None, organisation_id=None):
		"""Build a filtered program query for administrator management."""
		query = cls.query
		if search:
			term = f"%{search.strip()}%"
			query = query.filter(db.or_(cls.name.ilike(term), cls.description.ilike(term)))
		if status:
			query = query.filter(db.func.lower(cls.status) == status.strip().lower())
		if organisation_id:
			query = query.filter(cls.organisation_id == organisation_id)
		return query.order_by(cls.program_id.desc())

	@classmethod
	def create_from_data(cls, data):
		"""Create an unsaved program instance from schema-validated input."""
		return cls(
			organisation_id=data["organisation_id"], name=data["name"],
			description=data.get("description"), category=data.get("category"),
			location=data.get("location"), eligibility=data.get("eligibility"),
			start_date=data.get("start_date"), end_date=data.get("end_date"),
			status=data.get("status", "active"),
		)
