from marshmallow import fields, validate

from app.extensions import ma
from app.models.programs import Program


class ProgramSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Program
        load_instance = False
        include_fk = True


class ProgramCreateSchema(ma.SQLAlchemyAutoSchema):
    organisation_id = fields.Integer(required=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=255))

    class Meta:
        model = Program
        load_instance = False
        fields = (
            "organisation_id",
            "name",
            "description",
            "category",
            "location",
            "eligibility",
            "start_date",
            "end_date",
        )


class ProgramUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Program
        load_instance = False
        fields = (
            "name",
            "description",
            "category",
            "location",
            "eligibility",
            "start_date",
            "end_date",
            "status",
        )


program_schema = ProgramSchema()
programs_schema = ProgramSchema(many=True)
program_create_schema = ProgramCreateSchema()
program_update_schema = ProgramUpdateSchema(partial=True)
