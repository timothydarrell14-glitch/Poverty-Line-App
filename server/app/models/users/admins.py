from app.extensions import db

class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=True, unique=True)
    active = db.Column(db.Boolean, default=True, nullable=False)

    user = db.relationship("User", back_populates="admin", uselist=False)
