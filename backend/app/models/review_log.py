from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime, timezone


class ReviewLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(foreign_key="user.user_id", index=True)
    word_id: int = Field(foreign_key="word.word_id", index=True)

    last_reviewed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    next_review_at: Optional[datetime] = Field(index=True)

    success: bool

    user: Optional["User"] = Relationship(back_populates="review_logs")
    word: Optional["Word"] = Relationship(back_populates="review_logs")
