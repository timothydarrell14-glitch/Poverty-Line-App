"""add active status to users"""
from alembic import op
import sqlalchemy as sa
revision = "2a7b9c1d3e4f"
down_revision = "1e6f5a7b8c9d"
branch_labels = None
depends_on = None
def upgrade():
    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
def downgrade():
    op.drop_column("users", "is_active")
