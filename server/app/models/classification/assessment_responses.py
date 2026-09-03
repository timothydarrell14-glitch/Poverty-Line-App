from app.extensions import db


class AssessmentResponse(db.Model):
    __tablename__ = "assessment_responses"

    response_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    question_id = db.Column(
        db.Integer, db.ForeignKey("assessment_questions.question_id"), nullable=False
    )
    answer = db.Column(db.Text)
    score = db.Column(db.Numeric(10, 2))
    answered_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    user = db.relationship("User")
    question = db.relationship("AssessmentQuestion", back_populates="responses")
