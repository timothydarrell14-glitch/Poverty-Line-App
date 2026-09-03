from marshmallow import fields, validate

from app.extensions import ma
from app.models.communication.community_posts import CommunityPost


class CommunityPostSchema(ma.SQLAlchemyAutoSchema):
    author_name = fields.Function(
        lambda obj: f"{obj.user.first_name} {obj.user.last_name}" if obj.user else "Anonymous"
    )
    author_avatar = fields.Function(
        lambda obj: obj.user.avatar_url if obj.user else None
    )
    community_name = fields.Function(
        lambda obj: obj.community.name if obj.community else "General"
    )

    class Meta:
        model = CommunityPost
        load_instance = False
        include_fk = True


class CommunityPostCreateSchema(ma.SQLAlchemyAutoSchema):
    community_id = fields.Integer(required=True)
    content = fields.String(required=True, validate=validate.Length(min=1))

    class Meta:
        model = CommunityPost
        load_instance = False
        fields = ("community_id", "content")


class CommunityPostUpdateSchema(ma.SQLAlchemyAutoSchema):
    content = fields.String(required=True, validate=validate.Length(min=1))

    class Meta:
        model = CommunityPost
        load_instance = False
        fields = ("content",)


community_post_schema = CommunityPostSchema()
community_posts_schema = CommunityPostSchema(many=True)
community_post_create_schema = CommunityPostCreateSchema()
community_post_update_schema = CommunityPostUpdateSchema()
