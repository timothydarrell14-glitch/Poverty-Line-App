from marshmallow import fields, validate

from app.extensions import ma
from app.models.users import User


class UserSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = User
		load_instance = False
		exclude = ("password_hash",)


class UserRegisterSchema(ma.SQLAlchemyAutoSchema):
	password = fields.String(required=True, load_only=True, validate=validate.Length(min=8))

	class Meta:
		model = User
		load_instance = False
		fields = (
			"first_name",
			"last_name",
			"email",
			"password",
			"phone",
			"date_of_birth",
			"gender",
			"education_level",
			"employment_status",
			"skills",
			"location",
		)


class UserUpdateSchema(ma.SQLAlchemyAutoSchema):
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
		)


user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_register_schema = UserRegisterSchema()
user_update_schema = UserUpdateSchema(partial=True)


class AdminUserUpdateSchema(UserUpdateSchema):
	role = fields.String(validate=validate.Length(min=1, max=50))


admin_user_update_schema = AdminUserUpdateSchema(partial=True)
