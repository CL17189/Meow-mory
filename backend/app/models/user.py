from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone


class User(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)

    email: str = Field(unique=True, index=True)
    preferred_language: str = Field(default="en", index=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    stories: List["Story"] = Relationship(back_populates="user")
    review_logs: List["ReviewLog"] = Relationship(back_populates="user")
