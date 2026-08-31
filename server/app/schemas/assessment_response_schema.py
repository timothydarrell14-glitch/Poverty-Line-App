from marshmallow import fields

from app.extensions import ma
from app.models.assessment_responses import AssessmentResponse


class AssessmentResponseSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = AssessmentResponse
        load_instance = False
        include_fk = True


class AssessmentResponseCreateSchema(ma.SQLAlchemyAutoSchema):
    question_id = fields.Integer(required=True)
    answer = fields.String(required=True)

    class Meta:
        model = AssessmentResponse
        load_instance = False
        fields = ("question_id", "answer", "score")


assessment_response_schema = AssessmentResponseSchema()
assessment_responses_schema = AssessmentResponseSchema(many=True)
assessment_response_create_schema = AssessmentResponseCreateSchema()
