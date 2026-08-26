from app.extensions import db


class Organisation(db.Model):
	__tablename__ = "organisations"

	organisation_id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(255), nullable=False)
	organisation_type = db.Column(db.String(100), nullable=False)
	description = db.Column(db.Text)
	email = db.Column(db.String(255))
	phone = db.Column(db.String(50))
	website = db.Column(db.String(255))
	location = db.Column(db.String(255))
	verified = db.Column(db.Boolean, nullable=False, default=False)
	owner_user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)

	programs = db.relationship("Program", back_populates="organisation")
	jobs = db.relationship("Job", back_populates="organisation")
