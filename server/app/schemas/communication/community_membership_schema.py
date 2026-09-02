from marshmallow import fields

from app.extensions import ma
from app.models.communication.community_membership import CommunityMembership


class CommunityMembershipSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CommunityMembership
        load_instance = False
        include_fk = True


class CommunityMembershipCreateSchema(ma.SQLAlchemyAutoSchema):
    community_id = fields.Integer(required=True)

    class Meta:
        model = CommunityMembership
        load_instance = False
        fields = ("community_id",)


community_membership_schema = CommunityMembershipSchema()
community_memberships_schema = CommunityMembershipSchema(many=True)
community_membership_create_schema = CommunityMembershipCreateSchema()
