from app.extensions import db

class Donor(db.Model):
    __tablename__ = "donors"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), unique=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone_number = db.Column(db.String(255))

    user = db.relationship("User", back_populates="donor", uselist=False)
    financial_donations = db.relationship("FinancialDonation", back_populates="donor")
    non_financial_donations = db.relationship("NonFinancialDonation", back_populates="donor")