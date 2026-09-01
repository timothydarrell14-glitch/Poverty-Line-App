from app.extensions import ma
from app.models.classification.assessment_questions import AssessmentQuestion


class AssessmentQuestionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = AssessmentQuestion
        load_instance = False


assessment_question_schema = AssessmentQuestionSchema()
assessment_questions_schema = AssessmentQuestionSchema(many=True)
