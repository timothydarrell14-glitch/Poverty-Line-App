from marshmallow import fields

from app.extensions import ma
from app.models.program_memberships import ProgramMembership


class ProgramMembershipSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = ProgramMembership
		load_instance = False


class ProgramMembershipCreateSchema(ma.SQLAlchemyAutoSchema):
	program_id = fields.Integer(required=True)

	class Meta:
		model = ProgramMembership
		load_instance = False
		fields = ("program_id",)


program_membership_schema = ProgramMembershipSchema()
program_memberships_schema = ProgramMembershipSchema(many=True)
program_membership_create_schema = ProgramMembershipCreateSchema()