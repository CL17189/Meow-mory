from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy import Column, JSON
from datetime import datetime, timezone


class Story(SQLModel, table=True):
    story_id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(foreign_key="user.user_id", index=True)

    language: str = Field(index=True)
    content: str

    word_count:int = Field(default=0)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional["User"] = Relationship(back_populates="stories")
