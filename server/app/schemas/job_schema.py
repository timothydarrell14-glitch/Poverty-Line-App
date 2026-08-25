from marshmallow import fields, validate

from app.extensions import ma
from app.models.jobs import Job


class JobSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = Job
		load_instance = False


class JobCreateSchema(ma.SQLAlchemyAutoSchema):
	organisation_id = fields.Integer(required=True)
	title = fields.String(required=True, validate=validate.Length(min=1, max=255))

	class Meta:
		model = Job
		load_instance = False
		fields = (
			"organisation_id",
			"title",
			"description",
			"requirements",
			"minimum_education",
			"experience",
			"application_deadline",
		)


class JobUpdateSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = Job
		load_instance = False
		partial = True
		fields = (
			"title",
			"description",
			"requirements",
			"minimum_education",
			"experience",
			"application_deadline",
			"status",
		)


job_schema = JobSchema()
jobs_schema = JobSchema(many=True)
job_create_schema = JobCreateSchema()
job_update_schema = JobUpdateSchema()