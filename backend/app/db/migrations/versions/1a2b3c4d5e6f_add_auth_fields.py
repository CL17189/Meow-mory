"""add authentication fields and word ownership

Revision ID: 1a2b3c4d5e6f
Revises: 745814f1830c
"""
from typing import Sequence, Union

from alembic import op
from alembic import context
import sqlalchemy as sa

revision: str = "1a2b3c4d5e6f"
down_revision: Union[str, Sequence[str], None] = "745814f1830c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = None if context.is_offline_mode() else sa.inspect(op.get_bind())
    user_columns = set() if inspector is None else {column["name"] for column in inspector.get_columns("user")}
    for name, column in {
        "password_hash": sa.Column("password_hash", sa.String(), nullable=True),
        "google_sub": sa.Column("google_sub", sa.String(), nullable=True),
        "display_name": sa.Column("display_name", sa.String(), nullable=True),
        "deleted_at": sa.Column("deleted_at", sa.DateTime(), nullable=True),
    }.items():
        if name not in user_columns:
            op.add_column("user", column)
    user_indexes = set() if inspector is None else {index["name"] for index in inspector.get_indexes("user")}
    if "ix_user_google_sub" not in user_indexes:
        op.create_index("ix_user_google_sub", "user", ["google_sub"], unique=True)

    word_columns = set() if inspector is None else {column["name"] for column in inspector.get_columns("word")}
    if "owner_user_id" not in word_columns:
        with op.batch_alter_table("word") as batch:
            batch.add_column(sa.Column("owner_user_id", sa.Integer(), nullable=True))
            batch.create_foreign_key("fk_word_owner_user", "user", ["owner_user_id"], ["user_id"])
    word_indexes = set() if inspector is None else {index["name"] for index in inspector.get_indexes("word")}
    if "ix_word_owner_user_id" not in word_indexes:
        op.create_index("ix_word_owner_user_id", "word", ["owner_user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_word_owner_user_id", table_name="word")
    with op.batch_alter_table("word") as batch:
        batch.drop_constraint("fk_word_owner_user", type_="foreignkey")
        batch.drop_column("owner_user_id")
    op.drop_index("ix_user_google_sub", table_name="user")
    op.drop_column("user", "deleted_at")
    op.drop_column("user", "display_name")
    op.drop_column("user", "google_sub")
    op.drop_column("user", "password_hash")
