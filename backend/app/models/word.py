from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone

class Word(SQLModel, table=True):
    word_id: Optional[int] = Field(default=None, primary_key=True)

    word_text: str = Field(index=True)
    language: str = Field(index=True)

    created_at: Optional[str] = Field(default_factory=lambda: datetime.now(timezone.utc))

    review_logs: List["ReviewLog"] = Relationship(back_populates="word")
