"""add role to users

Revision ID: 1e6f5a7b8c9d
Revises: 34430b459687
Create Date: 2026-08-30 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "1e6f5a7b8c9d"
down_revision = "34430b459687"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("role", sa.String(length=50), nullable=False, server_default="user"),
    )


def downgrade():
    op.drop_column("users", "role")
