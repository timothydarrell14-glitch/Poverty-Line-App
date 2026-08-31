from marshmallow import fields, validate

from app.extensions import ma
from app.models.community_posts import CommunityPost


class CommunityPostSchema(ma.SQLAlchemyAutoSchema):
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