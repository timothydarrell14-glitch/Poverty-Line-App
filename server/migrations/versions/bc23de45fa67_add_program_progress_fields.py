"""add program progress metadata

Revision ID: bc23de45fa67
Revises: ab12cd34ef56
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "bc23de45fa67"
down_revision = "ab12cd34ef56"
branch_labels = None
depends_on = None


def upgrade():
    table_names = set(inspect(op.get_bind()).get_table_names())
    if "programs" not in table_names:
        return
    columns = {column["name"] for column in inspect(op.get_bind()).get_columns("programs")}
    additions = {
        "program_kind": sa.Column("program_kind", sa.String(length=30), nullable=True, server_default="financial"),
        "funding_goal": sa.Column("funding_goal", sa.Numeric(precision=12, scale=2), nullable=True),
        "progress_target": sa.Column("progress_target", sa.Integer(), nullable=True),
        "progress_value": sa.Column("progress_value", sa.Integer(), nullable=True, server_default="0"),
        "progress_unit": sa.Column("progress_unit", sa.String(length=100), nullable=True),
    }
    for name, column in additions.items():
        if name not in columns:
            op.add_column("programs", column)
    op.execute("UPDATE programs SET program_kind = 'financial' WHERE program_kind IS NULL")
    op.execute("UPDATE programs SET progress_value = 0 WHERE progress_value IS NULL")


def downgrade():
    table_names = set(inspect(op.get_bind()).get_table_names())
    if "programs" not in table_names:
        return
    columns = {column["name"] for column in inspect(op.get_bind()).get_columns("programs")}
    for name in ("progress_unit", "progress_value", "progress_target", "funding_goal", "program_kind"):
        if name in columns:
            op.drop_column("programs", name)
