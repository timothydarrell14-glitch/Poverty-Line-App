from app.extensions import db


class Job(db.Model):
    __tablename__ = "jobs"

    job_id = db.Column(db.Integer, primary_key=True)
    organisation_id = db.Column(
        db.Integer, db.ForeignKey("organisations.organisation_id"), nullable=False
    )
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    minimum_education = db.Column(db.String(100))
    experience = db.Column(db.String(50))
    application_deadline = db.Column(db.Date)
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    organisation = db.relationship("Organisation", back_populates="jobs")
    applications = db.relationship("JobApplication", back_populates="job")
