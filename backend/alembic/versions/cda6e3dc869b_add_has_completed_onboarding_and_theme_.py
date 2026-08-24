"""add has_completed_onboarding and theme_preference to user

Revision ID: cda6e3dc869b
Revises: 6e6dad280313
Create Date: 2026-08-22 20:29:41.358114

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'cda6e3dc869b'
down_revision: Union[str, Sequence[str], None] = '6e6dad280313'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    theme_enum = postgresql.ENUM('light', 'dark', 'system', name='themepreferences')
    theme_enum.create(op.get_bind(), checkfirst=True)

    op.drop_constraint(op.f('task_assigned_to_fkey'), 'task', type_='foreignkey')
    op.create_foreign_key(None, 'task', 'user', ['assigned_to'], ['id'], ondelete='SET NULL')
    op.add_column('user', sa.Column('has_completed_onboarding', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('user', sa.Column(
        'theme_preference',
        postgresql.ENUM('light', 'dark', 'system', name='themepreferences', create_type=False),
        nullable=False,
        server_default='system'
    ))


def downgrade() -> None:
    op.drop_column('user', 'theme_preference')
    op.drop_column('user', 'has_completed_onboarding')
    op.drop_constraint(None, 'task', type_='foreignkey')
    op.create_foreign_key(op.f('task_assigned_to_fkey'), 'task', 'user', ['assigned_to'], ['id'])
    postgresql.ENUM('light', 'dark', 'system', name='themepreferences').drop(op.get_bind(), checkfirst=True)