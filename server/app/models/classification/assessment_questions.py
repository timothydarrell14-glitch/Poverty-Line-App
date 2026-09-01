from app.extensions import db


class AssessmentQuestion(db.Model):
    __tablename__ = "assessment_questions"

    question_id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    question_type = db.Column(db.String(50))
    weight = db.Column(db.Numeric(10, 2))
    is_required = db.Column(db.Boolean, nullable=False, default=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    responses = db.relationship("AssessmentResponse", back_populates="question")
