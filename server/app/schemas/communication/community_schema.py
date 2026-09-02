from marshmallow import fields, validate

from app.extensions import ma
from app.models.communication.communities import Community


class CommunitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Community
        load_instance = False


class CommunityCreateSchema(ma.SQLAlchemyAutoSchema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=255))

    class Meta:
        model = Community
        load_instance = False
        fields = ("name", "description", "category", "location")


class CommunityUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Community
        load_instance = False
        fields = ("name", "description", "category", "location")


community_schema = CommunitySchema()
communities_schema = CommunitySchema(many=True)
community_create_schema = CommunityCreateSchema()
community_update_schema = CommunityUpdateSchema(partial=True)
