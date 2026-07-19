from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_current_user
from app.core.languages import normalize_language
from app.core.redis import get_json, set_json, delete_pattern
from app.db.session import get_session
from app.models.user import User
from app.models.word import Word
from app.services.common import SYSTEM_WORDS

router = APIRouter(prefix="/vocabularies", tags=["vocabularies"])


@router.get("/recent")
def list_vocabularies(language: str = "en", limit: int = 20, offset: int = 0,
                      user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    try:
        language = normalize_language(language)
    except ValueError as exc:
        raise HTTPException(422, detail={"code": "INVALID_LANGUAGE", "message": str(exc)}) from exc
    key = f"meowmory:vocab:{user.user_id}:{language}:{limit}:{offset}"
    cached = get_json(key)
    if cached is not None:
        return cached
    words = session.exec(select(Word).where(Word.language == language.lower(),
                                            (Word.owner_user_id == user.user_id) |
                                            ((Word.owner_user_id.is_(None)) & Word.word_text.in_(SYSTEM_WORDS.get(language.lower(), set()))))
                         .order_by(Word.word_id)).all()
    if not words:
        result = {"items": [], "total": 0, "limit": limit, "offset": offset}
        set_json(key, result, ttl_seconds=30)
        return result
    result = {"items": [{"id": language.lower(), "name": f"{language.upper()} vocabulary",
                        "language": language.lower(), "word_count": len(words),
                        "preview": [word.word_text for word in words[:5]],
                        "updated_at": words[-1].created_at}],
            "total": 1, "limit": limit, "offset": offset}
    set_json(key, result, ttl_seconds=30)
    return result


@router.get("/{vocab_id}/words")
def get_vocabulary_words(vocab_id: str, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    try:
        language = normalize_language(vocab_id)
    except ValueError as exc:
        raise HTTPException(422, detail={"code": "INVALID_LANGUAGE", "message": str(exc)}) from exc
    key = f"meowmory:vocab-words:{user.user_id}:{language}"
    cached = get_json(key)
    if cached is not None:
        return cached
    words = session.exec(select(Word).where(Word.language == language,
                                            (Word.owner_user_id == user.user_id) |
                                            ((Word.owner_user_id.is_(None)) & Word.word_text.in_(SYSTEM_WORDS.get(language, set()))))
                         .order_by(Word.word_id)).all()
    if not words:
        raise HTTPException(404, detail={"code": "NOT_FOUND", "message": "Vocabulary not found"})
    result = [word.word_text for word in words]
    set_json(key, result, ttl_seconds=60)
    return result
