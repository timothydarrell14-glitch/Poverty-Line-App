from marshmallow import fields, validate

from app.extensions import ma
from app.models.users.users import ACCOUNT_ROLES, User


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = False
        exclude = ("password_hash",)


class UserRegisterSchema(ma.SQLAlchemyAutoSchema):
    role = fields.String(load_default="member", validate=validate.OneOf(("member", "donor")))
    date_of_birth = fields.Date(allow_none=True, load_default=None)
    gender = fields.String(allow_none=True, load_default=None)
    education_level = fields.String(allow_none=True, load_default=None)
    employment_status = fields.String(allow_none=True, load_default=None)
    skills = fields.String(allow_none=True, load_default=None)
    location = fields.String(allow_none=True, load_default=None)
    password = fields.String(
        required=True, load_only=True, validate=validate.Length(min=8)
    )

    class Meta:
        model = User
        load_instance = False
        fields = (
            "first_name",
            "last_name",
            "email",
            "password",
            "role",
            "phone",
            "date_of_birth",
            "gender",
            "education_level",
            "employment_status",
            "skills",
            "location",
        )


class UserUpdateSchema(ma.SQLAlchemyAutoSchema):
    date_of_birth = fields.Date(allow_none=True)
    gender = fields.String(allow_none=True)
    education_level = fields.String(allow_none=True)
    employment_status = fields.String(allow_none=True)
    skills = fields.String(allow_none=True)
    location = fields.String(allow_none=True)
    class Meta:
        model = User
        load_instance = False
        fields = (
            "first_name",
            "last_name",
            "email",
            "phone",
            "date_of_birth",
            "gender",
            "education_level",
            "employment_status",
            "skills",
            "location",
            "avatar_url",
            "cover_url",
        )


user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_register_schema = UserRegisterSchema()
user_update_schema = UserUpdateSchema(partial=True)


class AdminUserUpdateSchema(UserUpdateSchema):
    role = fields.String(validate=validate.OneOf(ACCOUNT_ROLES))


admin_user_update_schema = AdminUserUpdateSchema(partial=True)
