"""add donor linkage and payment fields

Revision ID: ab12cd34ef56
Revises: 9f1c2d3e4b5a
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "ab12cd34ef56"
down_revision = "9f1c2d3e4b5a"
branch_labels = None
depends_on = None


def _columns(table_name):
    return {column["name"] for column in inspect(op.get_bind()).get_columns(table_name)}


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    tables = set(inspector.get_table_names())

    if "programs" in tables and "program_id" in _columns("programs"):
        with op.batch_alter_table("programs", recreate="always") as batch:
            batch.alter_column("program_id", new_column_name="id")
            batch.alter_column("name", new_column_name="title")
            batch.alter_column("category", new_column_name="type")
            batch.add_column(sa.Column("summary", sa.String(length=500), nullable=True))
            batch.add_column(sa.Column("created_at", sa.DateTime(), nullable=True))
            batch.add_column(sa.Column("created_by", sa.Integer(), nullable=True))
            batch.add_column(sa.Column("active", sa.Boolean(), nullable=True))
            batch.drop_column("eligibility")
            batch.drop_column("start_date")
            batch.drop_column("end_date")
            batch.drop_column("status")
        op.execute("UPDATE programs SET active = 1 WHERE active IS NULL")
        with op.batch_alter_table("programs", recreate="always") as batch:
            batch.alter_column("active", nullable=False, server_default=sa.true())

    if "donors" not in tables:
        op.create_table(
            "donors",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=True, unique=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False, unique=True),
            sa.Column("phone_number", sa.String(length=255), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        )
    else:
        columns = _columns("donors")
        if "user_id" not in columns:
            op.add_column("donors", sa.Column("user_id", sa.Integer(), nullable=True))
            op.create_unique_constraint("uq_donors_user_id", "donors", ["user_id"])
            op.create_foreign_key("fk_donors_user_id", "donors", "users", ["user_id"], ["user_id"])

    if "financial_donations" not in tables:
        op.create_table(
            "financial_donations",
            sa.Column("donation_id", sa.Integer(), primary_key=True),
            sa.Column("transaction_code", sa.String(length=255), nullable=True),
            sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
            sa.Column("currency", sa.String(length=3), nullable=False, server_default="KES"),
            sa.Column("donation_date", sa.Date(), nullable=True),
            sa.Column("payment_method", sa.String(length=50), nullable=True),
            sa.Column("program_id", sa.Integer(), nullable=True),
            sa.Column("donor_id", sa.Integer(), nullable=True),
            sa.Column("payment_status", sa.String(length=30), nullable=False, server_default="pending"),
            sa.Column("provider_reference", sa.String(length=255), nullable=True, unique=True),
            sa.ForeignKeyConstraint(["program_id"], ["programs.id"]),
            sa.ForeignKeyConstraint(["donor_id"], ["donors.id"]),
        )
    else:
        columns = _columns("financial_donations")
        additions = {
            "transaction_code": sa.Column("transaction_code", sa.String(length=255), nullable=True),
            "currency": sa.Column("currency", sa.String(length=3), nullable=True, server_default="KES"),
            "program_id": sa.Column("program_id", sa.Integer(), nullable=True),
            "donor_id": sa.Column("donor_id", sa.Integer(), nullable=True),
            "payment_status": sa.Column("payment_status", sa.String(length=30), nullable=True, server_default="pending"),
            "provider_reference": sa.Column("provider_reference", sa.String(length=255), nullable=True),
        }
        for name, column in additions.items():
            if name not in columns:
                op.add_column("financial_donations", column)


def downgrade():
    bind = op.get_bind()
    if "financial_donations" in inspect(bind).get_table_names():
        op.drop_table("financial_donations")