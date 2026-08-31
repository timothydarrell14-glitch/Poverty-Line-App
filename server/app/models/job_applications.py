from app.extensions import db


class JobApplication(db.Model):
    __tablename__ = "job_applications"

    application_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.job_id"), nullable=False)
    application_date = db.Column(
        db.DateTime, nullable=False, server_default=db.func.now()
    )
    status = db.Column(db.String(50))

    user = db.relationship("User", back_populates="job_applications")
    job = db.relationship("Job", back_populates="applications")

    __table_args__ = (db.UniqueConstraint("user_id", "job_id"),)
