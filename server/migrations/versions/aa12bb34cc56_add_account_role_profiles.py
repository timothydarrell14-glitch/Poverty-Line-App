"""add account role profiles"""

from alembic import op
import sqlalchemy as sa


revision = "aa12bb34cc56"
down_revision = ("99a46e7ee091", "c517d003a957")
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE users SET role = 'member' WHERE role = 'user'")
    op.create_table(
        "members",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=False, unique=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("gender", sa.String(length=50), nullable=True),
        sa.Column("education_level", sa.String(length=100), nullable=True),
        sa.Column("employment_status", sa.String(length=100), nullable=True),
        sa.Column("skills", sa.Text(), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("poverty_classification", sa.String(length=50), nullable=True),
        sa.Column("poverty_score", sa.Numeric(10, 2), nullable=True),
    )
    op.create_table(
        "partners",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=False, unique=True),
        sa.Column("organisation_name", sa.String(length=255), nullable=True),
    )
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=True, unique=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.execute("""
        INSERT INTO members (user_id, date_of_birth, gender, education_level,
                     employment_status, skills, location,
                     poverty_classification, poverty_score)
        SELECT user_id, date_of_birth, gender, education_level,
             employment_status, skills, location,
             poverty_classification, poverty_score
        FROM users
        WHERE role = 'member'
    """)
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("date_of_birth")
        batch_op.drop_column("gender")
        batch_op.drop_column("education_level")
        batch_op.drop_column("employment_status")
        batch_op.drop_column("skills")
        batch_op.drop_column("location")
        batch_op.drop_column("poverty_classification")
        batch_op.drop_column("poverty_score")


def downgrade():
    op.drop_table("admins")
    op.drop_table("partners")
    op.drop_table("members")