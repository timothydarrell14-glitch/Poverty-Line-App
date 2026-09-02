from app.extensions import db

class Donor(db.Model):
    __tablename__ = 'donors'

    name = db.Column(db.String(255), nullable=False) 
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone_number = db.Column(db.String(255), nullable=False)

    financial_donations = db.relationship("FinancialDonation", back_populates="donor")
    non_financial_donations = db.relationship("NonFinancialDonation", back_populates="donor")