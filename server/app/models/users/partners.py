from app.extensions import db


class Partner(db.Model):
    __tablename__ = "partners"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False, unique=True)
    organisation_name = db.Column(db.String(255))

    user = db.relationship("User", back_populates="partner", uselist=False)