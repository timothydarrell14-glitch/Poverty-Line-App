from app.extensions import db
from sqlalchemy.orm import foreign
from app.models.classification.assessment_responses import AssessmentResponse
from app.models.classification.job_applications import JobApplication
from app.models.communication.community_membership import CommunityMembership
from app.models.communication.community_posts import CommunityPost


class Member(db.Model):
    __tablename__ = "members"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False, unique=True)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(50))
    education_level = db.Column(db.String(100))
    employment_status = db.Column(db.String(100))
    skills = db.Column(db.Text)
    location = db.Column(db.String(255))
    poverty_classification = db.Column(db.String(50), nullable=True)
    poverty_score = db.Column(db.Numeric(10, 2), nullable=True)

    user = db.relationship("User", back_populates="member", uselist=False)
    assessment_responses = db.relationship(
        "AssessmentResponse",
        primaryjoin=lambda: Member.user_id == foreign(AssessmentResponse.user_id),
        viewonly=True,
    )
    job_applications = db.relationship(
        "JobApplication",
        primaryjoin=lambda: Member.user_id == foreign(JobApplication.user_id),
        viewonly=True,
    )
    community_posts = db.relationship(
        "CommunityPost",
        primaryjoin=lambda: Member.user_id == foreign(CommunityPost.user_id),
        viewonly=True,
    )
    community_memberships = db.relationship(
        "CommunityMembership",
        primaryjoin=lambda: Member.user_id == foreign(CommunityMembership.user_id),
        viewonly=True,
    )
