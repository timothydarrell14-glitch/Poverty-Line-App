from extensions import db

class NonFinancialDonation(db.Model):
    __tablename__ = "non_financial_donations"

    type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    donation_date = db.Column(db.Date)
    donor_id = db.Column(db.Integer, db.ForeignKey("donors.donor_id"))
    program_id = db.Column(db.Integer, db.ForeignKey("programs.program_id"))

    program = db.relationship("Program", back_populates="non_financial_donations")
    donor = db.relationship("Donor", back_populates="non_financial_donations")