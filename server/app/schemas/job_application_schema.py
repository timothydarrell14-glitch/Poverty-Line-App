from marshmallow import fields

from app.extensions import ma
from app.models.job_applications import JobApplication


class JobApplicationSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = JobApplication
		load_instance = False
		include_fk = True


class JobApplicationCreateSchema(ma.SQLAlchemyAutoSchema):
	job_id = fields.Integer(required=True)

	class Meta:
		model = JobApplication
		load_instance = False
		fields = ("job_id",)


job_application_schema = JobApplicationSchema()
job_applications_schema = JobApplicationSchema(many=True)
job_application_create_schema = JobApplicationCreateSchema()