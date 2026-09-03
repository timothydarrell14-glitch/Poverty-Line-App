"""add program image and long description fields

Revision ID: cd34ef56ab78
Revises: bc23de45fa67
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "cd34ef56ab78"
down_revision = "bc23de45fa67"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    tables = set(inspect(bind).get_table_names())
    if "programs" not in tables:
        return
    columns = {column["name"] for column in inspect(bind).get_columns("programs")}
    if "long_description" not in columns:
        op.add_column("programs", sa.Column("long_description", sa.Text(), nullable=True))
    if "image_url" not in columns:
        op.add_column("programs", sa.Column("image_url", sa.String(length=500), nullable=True))


def downgrade():
    bind = op.get_bind()
    if "programs" not in inspect(bind).get_table_names():
        return
    columns = {column["name"] for column in inspect(bind).get_columns("programs")}
    if "image_url" in columns:
        op.drop_column("programs", "image_url")
    if "long_description" in columns:
        op.drop_column("programs", "long_description")
