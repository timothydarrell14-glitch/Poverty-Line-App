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
    program_kind = fields.String(load_default="financial", validate=validate.OneOf(["financial", "non_financial"]))
    funding_goal = fields.Decimal(load_default=None, allow_none=True, validate=validate.Range(min=0))
    progress_target = fields.Integer(load_default=None, allow_none=True, validate=validate.Range(min=0))
    progress_value = fields.Integer(load_default=0, validate=validate.Range(min=0))
    progress_unit = fields.String(load_default=None, allow_none=True)

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
            "long_description",
            "image_url",
            "summary",
            "type",
            "location",
            "active",
            "program_kind",
            "funding_goal",
            "progress_target",
            "progress_value",
            "progress_unit",
        )


class ProgramUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Program
        load_instance = False
        fields = (
            "title",
            "description",
            "long_description",
            "image_url",
            "summary",
            "type",
            "location",
            "active",
            "program_kind",
            "funding_goal",
            "progress_target",
            "progress_value",
            "progress_unit",
        )


program_schema = ProgramSchema()
programs_schema = ProgramSchema(many=True)
program_create_schema = ProgramCreateSchema()
program_update_schema = ProgramUpdateSchema(partial=True)
