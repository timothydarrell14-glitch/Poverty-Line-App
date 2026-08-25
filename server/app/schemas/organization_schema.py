from marshmallow import fields, validate, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from app.models.organization import Organization


class OrganizationSchema(SQLAlchemyAutoSchema):

    class Meta:
        model = Organization
        load_instance = False

    # ========================================================
    # ID
    # ========================================================

    id = fields.Int(
        dump_only=True
    )

    # ========================================================
    # NAME
    # ========================================================

    name = fields.Str(
        required=True,
        validate=validate.Length(
            min=1,
            max=255
        )
    )

    # ========================================================
    # ORGANIZATION TYPE
    # ========================================================

    organization_type = fields.Str(
        required=True
    )

    # ========================================================
    # DESCRIPTION
    # ========================================================

    description = fields.Str(
        required=True
    )

    # ========================================================
    # MISSION
    # ========================================================

    mission = fields.Str(
        required=True
    )

    # ========================================================
    # SERVICE AREA
    # ========================================================

    service_area = fields.Str(
        required=True
    )

    # ========================================================
    # EMAIL
    # ========================================================

    email = fields.Email(
        required=True
    )

    # ========================================================
    # PHONE
    # ========================================================

    phone = fields.Str(
        allow_none=True
    )

    # ========================================================
    # WEBSITE
    # ========================================================

    website = fields.Url(
        allow_none=True
    )

    # ========================================================
    # LOGO
    # ========================================================

    logo = fields.Str(
        allow_none=True
    )

    # ========================================================
    # VERIFICATION STATUS
    # ========================================================

    verification_status = fields.Str(
        dump_only=True
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

    created_at = fields.DateTime(
        dump_only=True
    )

    updated_at = fields.DateTime(
        dump_only=True
    )

    # ========================================================
    # NAME VALIDATION
    # ========================================================

    @validates("name")
    def validate_name(self, value, **kwargs):

        if value is None:
            raise ValidationError(
                "Organization name is required."
            )

        if not isinstance(value, str):
            raise ValidationError(
                "Organization name must be a string."
            )

        if not value.strip():
            raise ValidationError(
                "Organization name cannot be empty."
            )

    # ========================================================
    # ORGANIZATION TYPE VALIDATION
    # ========================================================

    @validates("organization_type")
    def validate_organization_type(
        self,
        value,
        **kwargs
    ):

        allowed_types = {
            "NGO",
            "CHARITY",
            "COMMUNITY",
            "NON_PROFIT"
        }

        if value not in allowed_types:
            raise ValidationError(
                "Invalid organization type."
            )

    # ========================================================
    # PHONE VALIDATION
    # ========================================================

    @validates("phone")
    def validate_phone(self, value, **kwargs):

        if value is None:
            return

        if not isinstance(value, str):
            raise ValidationError(
                "Invalid phone number."
            )

        cleaned = (
            value
            .replace("+", "")
            .replace(" ", "")
            .replace("-", "")
        )

        if not cleaned.isdigit():
            raise ValidationError(
                "Invalid phone number."
            )

        if len(cleaned) < 9 or len(cleaned) > 15:
            raise ValidationError(
                "Invalid phone number."
            )


# ============================================================
# SCHEMA INSTANCES
# ============================================================

organization_schema = OrganizationSchema()

organizations_schema = OrganizationSchema(
    many=True
)