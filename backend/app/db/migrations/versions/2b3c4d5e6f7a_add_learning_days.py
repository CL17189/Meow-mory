"""add daily learning activity for streaks

Revision ID: 2b3c4d5e6f7a
Revises: 1a2b3c4d5e6f
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2b3c4d5e6f7a"
down_revision: Union[str, Sequence[str], None] = "1a2b3c4d5e6f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "learning_day",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("activity_date", sa.Date(), nullable=False),
        sa.Column("activity_count", sa.Integer(), nullable=False),
        sa.Column("last_activity_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "activity_date", name="uq_learning_day_user_date"),
    )
    op.create_index(op.f("ix_learning_day_user_id"), "learning_day", ["user_id"], unique=False)
    op.create_index(op.f("ix_learning_day_activity_date"), "learning_day", ["activity_date"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_learning_day_activity_date"), table_name="learning_day")
    op.drop_index(op.f("ix_learning_day_user_id"), table_name="learning_day")
    op.drop_table("learning_day")
