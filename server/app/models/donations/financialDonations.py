from app.extensions import db


class FinancialDonation(db.Model):
    __tablename__ = "financial_donations"

    donation_id = db.Column(db.Integer, primary_key=True)
    transaction_code = db.Column(db.String(255))
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="KES")
    donation_date = db.Column(db.Date)
    payment_method = db.Column(db.String(50))
    program_id = db.Column(db.Integer, db.ForeignKey("programs.id"))
    donor_id = db.Column(db.Integer, db.ForeignKey("donors.id"))
    payment_status = db.Column(db.String(30), nullable=False, default="pending")
    provider_reference = db.Column(db.String(255), unique=True)

    program = db.relationship("Program", back_populates="financial_donations")
    donor = db.relationship("Donor", back_populates="financial_donations")
