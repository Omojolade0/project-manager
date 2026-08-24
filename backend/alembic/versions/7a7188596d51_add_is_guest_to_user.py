"""add is_guest to user

Revision ID: 7a7188596d51
Revises: cda6e3dc869b
Create Date: 2026-08-23 12:21:15.181878

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a7188596d51'
down_revision: Union[str, Sequence[str], None] = 'cda6e3dc869b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('user', sa.Column('is_guest', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('user', 'is_guest')
