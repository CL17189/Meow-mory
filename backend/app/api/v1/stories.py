from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_validator, model_validator
from sqlmodel import Session

from app.db.session import get_session
from app.core.auth import get_current_user
from app.core.languages import normalize_language
from app.core.redis import delete_pattern, get_json, redis_status, set_json
from app.models.user import User
from app.services.story_service import generate_story, get_story, get_story_words, list_stories
from app.services.streak_service import record_learning_activity

router = APIRouter(prefix="/stories", tags=["stories"])


class StoryGenerateRequest(BaseModel):
    language: str | None = None
    lang: str | None = None
    words: list[str] = Field(min_length=1)
    wordcount: int | None = Field(default=None, ge=1, le=100)
    word_count: int | None = Field(default=None, ge=1, le=100)
    difficulty: str = "A2"
    style: str = "joke"
    startwith: str | None = None
    start_with: str | None = None

    @field_validator("language", "lang", mode="before")
    @classmethod
    def validate_language(cls, value: str | None) -> str | None:
        if value is None:
            return value
        try:
            return normalize_language(value)
        except ValueError as exc:
            raise ValueError(str(exc)) from exc

    @model_validator(mode="after")
    def validate_language_aliases(self):
        if self.language and self.lang and self.language != self.lang:
            raise ValueError("language and lang must match when both are provided")
        return self

    @property
    def resolved_language(self) -> str:
        return normalize_language(self.language or self.lang)

    @property
    def resolved_count(self) -> int | None:
        return self.wordcount or self.word_count


class StoryResponse(BaseModel):
    story_id: int
    user_id: str
    language: str
    content: str
    word_count: int
    created_at: datetime


class StoryJobResponse(BaseModel):
    task_id: str
    status: str
    result_url: str


def serialize(story, user_id: int):
    return {"story_id": story.story_id, "user_id": str(user_id), "language": story.language,
            "content": story.content, "word_count": story.word_count, "created_at": story.created_at}


@router.post("/generate", response_model=StoryResponse)
def generate_story_api(payload: StoryGenerateRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    try:
        story = generate_story(session, payload.resolved_language, payload.words, user.user_id,
                               payload.resolved_count, payload.difficulty, payload.style,
                               payload.startwith or payload.start_with)
    except ValueError as exc:
        raise HTTPException(422, detail={"code": "INVALID_INPUT", "message": str(exc)}) from exc
    record_learning_activity(session, user.user_id)
    delete_pattern(f"meowmory:stories:{user.user_id}:*")
    return serialize(story, user.user_id)


@router.post("/generate/async", response_model=StoryJobResponse, status_code=202)
def generate_story_async(payload: StoryGenerateRequest, user: User = Depends(get_current_user)):
    if not redis_status()["available"]:
        raise HTTPException(503, detail={"code": "REDIS_UNAVAILABLE", "message": "Async generation requires Redis"})
    from app.worker.tasks import generate_story_task
    task = generate_story_task.delay({
        "language": payload.resolved_language,
        "words": payload.words,
        "user_id": user.user_id,
        "wordcount": payload.resolved_count,
        "difficulty": payload.difficulty,
        "style": payload.style,
        "startwith": payload.startwith or payload.start_with,
    })
    return {"task_id": task.id, "status": "PENDING", "result_url": f"/api/v1/stories/jobs/{task.id}"}


@router.get("", response_model=dict)
def list_stories_api(language: str | None = None, limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0), cache: bool = Query(True, include_in_schema=False), user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    try:
        language = normalize_language(language) if language else None
        key = f"meowmory:stories:{user.user_id}:{language or 'all'}:{limit}:{offset}"
        if cache:
            cached = get_json(key)
            if cached is not None:
                return cached
        result = list_stories(session, user.user_id, language, limit, offset)
        if cache:
            set_json(key, result, ttl_seconds=30)
        return result
    except ValueError as exc:
        raise HTTPException(422, detail={"code": "INVALID_LANGUAGE", "message": str(exc)}) from exc


@router.get("/jobs/{task_id}")
def get_story_job(task_id: str, user: User = Depends(get_current_user)):
    if not redis_status()["available"]:
        raise HTTPException(503, detail={"code": "REDIS_UNAVAILABLE", "message": "Async generation requires Redis"})
    from celery.result import AsyncResult
    from app.worker.celery_app import celery_app
    task = AsyncResult(task_id, app=celery_app)
    if task.state == "SUCCESS":
        result = task.result
        if str(result.get("user_id")) != str(user.user_id):
            raise HTTPException(404, detail={"code": "NOT_FOUND", "message": "Story job not found"})
        return {"task_id": task_id, "status": task.state, "result": result}
    if task.state == "FAILURE":
        return {"task_id": task_id, "status": task.state, "error": str(task.result)}
    return {"task_id": task_id, "status": task.state}


@router.get("/{story_id}", response_model=StoryResponse)
def get_story_api(story_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    story = get_story(session, story_id, user.user_id)
    if not story:
        raise HTTPException(404, detail={"code": "NOT_FOUND", "message": "Story not found"})
    record_learning_activity(session, user.user_id)
    return serialize(story, user.user_id)


@router.get("/{story_id}/words")
def get_story_words_api(story_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not get_story(session, story_id, user.user_id):
        raise HTTPException(404, detail={"code": "NOT_FOUND", "message": "Story not found"})
    return get_story_words(session, story_id, user.user_id)
