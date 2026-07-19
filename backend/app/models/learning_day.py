from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, Date, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class LearningDay(SQLModel, table=True):
    __tablename__ = "learning_day"
    __table_args__ = (
        UniqueConstraint("user_id", "activity_date", name="uq_learning_day_user_date"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id", index=True)
    activity_date: date = Field(sa_column=Column(Date, nullable=False, index=True))
    activity_count: int = Field(default=1, nullable=False)
    last_activity_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    user: Optional["User"] = Relationship(back_populates="learning_days")
