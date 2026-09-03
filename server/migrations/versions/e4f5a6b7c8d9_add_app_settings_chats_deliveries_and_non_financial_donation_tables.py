"""add app settings, chats, deliveries, and non-financial donation tables

Revision ID: e4f5a6b7c8d9
Revises: f849f5465974
Create Date: 2026-09-03 22:25:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e4f5a6b7c8d9'
down_revision = 'f849f5465974'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if 'app_settings' not in tables:
        op.create_table(
            'app_settings',
            sa.Column('setting_id', sa.Integer(), primary_key=True),
            sa.Column('key', sa.String(length=255), nullable=False, unique=True),
            sa.Column('value', sa.Text(), nullable=True),
            sa.Column('category', sa.String(length=100), server_default='general', nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    if 'chats' not in tables:
        op.create_table(
            'chats',
            sa.Column('chat_id', sa.Integer(), primary_key=True),
            sa.Column('contact_name', sa.String(length=255), nullable=False),
            sa.Column('role', sa.String(length=100), server_default='Partner', nullable=False),
            sa.Column('last_message', sa.Text(), server_default='', nullable=False),
            sa.Column('status', sa.String(length=100), server_default='Active now', nullable=False),
            sa.Column('unread_count', sa.Integer(), server_default='0', nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    if 'deliveries' not in tables:
        op.create_table(
            'deliveries',
            sa.Column('delivery_id', sa.Integer(), primary_key=True),
            sa.Column('reference_code', sa.String(length=50), nullable=False, unique=True),
            sa.Column('destination', sa.String(length=255), nullable=False),
            sa.Column('status', sa.String(length=50), server_default='In Transit', nullable=False),
            sa.Column('last_update', sa.String(length=255), server_default='Updated: Just now', nullable=False),
            sa.Column('marker_class', sa.String(length=255), server_default='delivery-map__marker--new', nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    if 'direct_chats' not in tables:
        op.create_table(
            'direct_chats',
            sa.Column('chat_id', sa.Integer(), primary_key=True),
            sa.Column('user1_id', sa.Integer(), sa.ForeignKey('users.user_id'), nullable=False),
            sa.Column('user2_id', sa.Integer(), sa.ForeignKey('users.user_id'), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        )

    if 'group_chats' not in tables:
        op.create_table(
            'group_chats',
            sa.Column('groupchat_id', sa.Integer(), primary_key=True),
            sa.Column('group_name', sa.String(length=255), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        )

    if 'group_chat_members' not in tables:
        op.create_table(
            'group_chat_members',
            sa.Column('group_id', sa.Integer(), sa.ForeignKey('group_chats.groupchat_id'), primary_key=True, nullable=False),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.user_id'), primary_key=True, nullable=False),
        )

    if 'admin_messages' not in tables:
        op.create_table(
            'admin_messages',
            sa.Column('message_id', sa.Integer(), primary_key=True),
            sa.Column('chat_id', sa.Integer(), sa.ForeignKey('direct_chats.chat_id'), nullable=False),
            sa.Column('sender_id', sa.Integer(), sa.ForeignKey('admins.id'), nullable=False),
            sa.Column('content', sa.String(length=255), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        )

    if 'non_financial_donations' not in tables:
        op.create_table(
            'non_financial_donations',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('type', sa.String(length=100), nullable=False),
            sa.Column('description', sa.String(length=255), nullable=False),
            sa.Column('donation_date', sa.Date(), nullable=True),
            sa.Column('donor_id', sa.Integer(), sa.ForeignKey('donors.id'), nullable=True),
            sa.Column('program_id', sa.Integer(), sa.ForeignKey('programs.id'), nullable=True),
        )

    if 'donations' in tables:
        op.drop_table('donations')
    if 'program_memberships' in tables:
        op.drop_table('program_memberships')


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if 'admin_messages' in tables:
        op.drop_table('admin_messages')
    if 'group_chat_members' in tables:
        op.drop_table('group_chat_members')
    if 'group_chats' in tables:
        op.drop_table('group_chats')
    if 'direct_chats' in tables:
        op.drop_table('direct_chats')
    if 'non_financial_donations' in tables:
        op.drop_table('non_financial_donations')
    if 'deliveries' in tables:
        op.drop_table('deliveries')
    if 'chats' in tables:
        op.drop_table('chats')
    if 'app_settings' in tables:
        op.drop_table('app_settings')
