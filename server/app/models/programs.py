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
