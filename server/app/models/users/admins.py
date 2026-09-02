from app.extensions import db

class Admin(db.Model):
    __tablename__ = 'admins'

    active = db.Column(db.Boolean, default=True, nullable=False)
