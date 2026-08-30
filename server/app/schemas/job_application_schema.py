from marshmallow import fields, validate

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


class JobApplicationStatusUpdateSchema(ma.SQLAlchemyAutoSchema):
	status = fields.String(required=True, validate=validate.OneOf(["accepted", "rejected"]))

	class Meta:
		model = JobApplication
		load_instance = False
		fields = ("status",)


job_application_schema = JobApplicationSchema()
job_applications_schema = JobApplicationSchema(many=True)
job_application_create_schema = JobApplicationCreateSchema()
job_application_status_update_schema = JobApplicationStatusUpdateSchema()