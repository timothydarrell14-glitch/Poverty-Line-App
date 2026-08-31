"""merge multiple heads"""
from alembic import op
import sqlalchemy as sa

revision = "9f1c2d3e4b5a"
down_revision = ("2a7b9c1d3e4f", "6da3c8034c1e")
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass