from marshmallow import fields, pre_load, validate

from app.extensions import ma
from app.models.programs import Program


class ProgramSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Program
        load_instance = False
        include_fk = True


class ProgramCreateSchema(ma.SQLAlchemyAutoSchema):
    organisation_id = fields.Integer(required=True)
    title = fields.String(required=True, validate=validate.Length(min=1, max=255))

    @pre_load
    def normalize_legacy_fields(self, data, **kwargs):
        data = dict(data or {})
        if "title" not in data and "name" in data:
            data["title"] = data.pop("name")
        if "type" not in data and "category" in data:
            data["type"] = data.pop("category")
        if "active" not in data and "status" in data:
            data["active"] = str(data.pop("status")).lower() == "active"
        for field in ("eligibility", "start_date", "end_date"):
            data.pop(field, None)
        return data

    class Meta:
        model = Program
        load_instance = False
        fields = (
            "organisation_id",
            "title",
            "description",
            "summary",
            "type",
            "location",
            "active",
        )


class ProgramUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Program
        load_instance = False
        fields = (
            "title",
            "description",
            "summary",
            "type",
            "location",
            "active",
        )


program_schema = ProgramSchema()
programs_schema = ProgramSchema(many=True)
program_create_schema = ProgramCreateSchema()
program_update_schema = ProgramUpdateSchema(partial=True)
