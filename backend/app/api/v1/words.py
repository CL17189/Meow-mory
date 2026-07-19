import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from sqlmodel import Session

from app.db.session import get_session
from app.core.auth import get_current_user
from app.core.languages import normalize_language
from app.models.user import User
from app.services.word_service import import_words, list_words
from app.core.redis import delete_pattern
from app.services.streak_service import record_learning_activity

router = APIRouter(prefix="/words", tags=["words"])


class WordImportRequest(BaseModel):
    language: str = "en"
    words: list[str] = Field(min_length=1)

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        try:
            return normalize_language(value)
        except ValueError as exc:
            raise ValueError(str(exc)) from exc


class WordImportResponse(BaseModel):
    language: str
    inserted: int
    skipped: int
    total: int


@router.post("", response_model=WordImportResponse)
def import_words_api(payload: WordImportRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    result = import_words(session, payload.words, payload.language, user.user_id)
    if result["inserted"] or result["skipped"]:
        record_learning_activity(session, user.user_id)
    delete_pattern(f"meowmory:vocab:{user.user_id}:*")
    delete_pattern(f"meowmory:vocab-words:{user.user_id}:*")
    return result


@router.post("/csv", response_model=WordImportResponse)
async def import_words_csv(request: Request, language: str = "en", user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Accept raw UTF-8 CSV so the API does not require python-multipart at import time.
    try:
        content = (await request.body()).decode("utf-8-sig")
        rows = list(csv.DictReader(io.StringIO(content)))
    except (UnicodeDecodeError, csv.Error) as exc:
        raise HTTPException(400, detail={"code": "INVALID_INPUT", "message": "CSV 必须是 UTF-8 格式"}) from exc
    if not rows or "word" not in rows[0]:
        raise HTTPException(400, detail={"code": "INVALID_INPUT", "message": "CSV 必须包含 word 列"})
    try:
        language = normalize_language(language)
    except ValueError as exc:
        raise HTTPException(422, detail={"code": "INVALID_LANGUAGE", "message": str(exc)}) from exc
    result = import_words(session, [row.get("word", "") for row in rows], language, user.user_id)
    if result["inserted"] or result["skipped"]:
        record_learning_activity(session, user.user_id)
    delete_pattern(f"meowmory:vocab:{user.user_id}:*")
    delete_pattern(f"meowmory:vocab-words:{user.user_id}:*")
    return result


@router.get("")
def get_words(language: str = "en", limit: int = 20, offset: int = 0, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    try:
        language = normalize_language(language)
    except ValueError as exc:
        raise HTTPException(422, detail={"code": "INVALID_LANGUAGE", "message": str(exc)}) from exc
    return list_words(session, language, limit, offset, user.user_id)
