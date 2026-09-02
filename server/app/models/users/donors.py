from extensions import db

class Donor(db.Model):
    __tablename__ = 'donor'

    name = db.Column(db.String(255), nullable=False) 
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone_number = db.Column(db.String(255), nullable=False)
    donations= db.Column(db.Float, nullable=False)