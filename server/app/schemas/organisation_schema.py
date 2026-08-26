from marshmallow import fields, validate

from app.extensions import ma
from app.models.organisations import Organisation


class OrganisationSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = Organisation
		load_instance = False


class OrganisationCreateSchema(ma.SQLAlchemyAutoSchema):
	name = fields.String(required=True, validate=validate.Length(min=1, max=255))
	email = fields.Email(required=True)

	class Meta:
		model = Organisation
		load_instance = False
		fields = (
			"name",
			"organisation_type",
			"description",
			"email",
			"phone",
			"website",
			"location",
		)


class OrganisationUpdateSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = Organisation
		load_instance = False
		fields = (
			"name",
			"organisation_type",
			"description",
			"email",
			"phone",
			"website",
			"location",
		)


organisation_schema = OrganisationSchema()
organisations_schema = OrganisationSchema(many=True)
organisation_create_schema = OrganisationCreateSchema()
organisation_update_schema = OrganisationUpdateSchema(partial=True)