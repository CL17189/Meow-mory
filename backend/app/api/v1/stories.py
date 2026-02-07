from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.services.story_service import generate_story

from app.db.session import get_session
from sqlmodel import Session

router = APIRouter(prefix="/stories", tags=["stories"])
class StoryGenerateRequest(BaseModel):
    language: str
    words: List[str]
    wordcount: Optional[int] = None
    difficulty: Optional[str] = None
    style: Optional[str] = None
    startwith: Optional[str] = None
    
class StoryGenerateResponse(BaseModel):
    story_id: int
    user_id: str
    language: str
    content: str
    word_count: int
    created_at: datetime


@router.post("/generate", response_model=StoryGenerateResponse)
def generate_story_api(
    payload: StoryGenerateRequest,
    session: Session = Depends(get_session),
):
    story = generate_story(
        session=session,
        language=payload.language,
        words=payload.words,
        wordcount=payload.wordcount,
        difficulty=payload.difficulty,
        style=payload.style,
        startwith=payload.startwith,
        user_id="anonymous",  # MVP 阶段
    )
    return story

####################################################
from app.services.story_service import list_stories
class StoryItem(BaseModel):
    story_id: int
    language: str
    content: str
    created_at: datetime
class StoryListResponse(BaseModel):
    items: list[StoryItem]
    limit: int
    offset: int
    total: int
@router.get("", response_model=StoryListResponse)
def list_stories_api(
    language: str | None = None,
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    result = list_stories(
        session=session,
        user_id="anonymous",
        language=language,
        limit=limit,
        offset=offset,
    )
    return result
