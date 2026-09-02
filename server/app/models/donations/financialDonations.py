from app.extensions import db


class FinancialDonation(db.Model):
    __tablename__ = "financial_donations"

    donation_id = db.Column(db.Integer, primary_key=True)
    transaction_code = db.Column(db.String(255))
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    donation_date = db.Column(db.Date)
    payment_method = db.Column(db.String(50))
    program_id = db.Column(db.Integer, db.ForeignKey("programs.program_id"))
    donor_id = db.Column(db.Integer, db.ForeignKey("donors.donor_id"))

    program = db.relationship("Program", back_populates="financial_donations")
    donor = db.relationship("Donor", back_populates="financial_donations")
