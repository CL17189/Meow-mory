# models/story_word.py
from sqlmodel import SQLModel, Field



class StoryWord(SQLModel, table=True):
    story_id: int = Field(
        foreign_key="story.story_id",
        primary_key=True
    )
    word_id: int = Field(
        foreign_key="word.word_id",
        primary_key=True
    )
