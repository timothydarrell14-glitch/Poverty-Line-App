from app.extensions import db


class Donation(db.Model):
	__tablename__ = "donations"

	donation_id = db.Column(db.Integer, primary_key=True)
	program_id = db.Column(db.Integer, db.ForeignKey("programs.program_id"), nullable=False)
	donor_name = db.Column(db.String(255))
	donor_type = db.Column(db.String(50))
	amount = db.Column(db.Numeric(12, 2), nullable=False)
	currency = db.Column(db.String(10))
	donation_date = db.Column(db.Date)
	payment_method = db.Column(db.String(50))
	anonymous = db.Column(db.Boolean, nullable=False, default=False)
	transaction_reference = db.Column(db.String(255))

	program = db.relationship("Program", back_populates="donations")
