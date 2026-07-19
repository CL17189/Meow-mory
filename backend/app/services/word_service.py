from sqlmodel import Session, select

from app.models.word import Word
from app.core.languages import normalize_language
from app.services.common import SYSTEM_WORDS


def import_words(session: Session, words: list[str], language: str = "en", owner_user_id: int | None = None) -> dict:
    language = normalize_language(language)
    normalized = [str(word).strip().lower() for word in words]
    normalized = [word for word in normalized if word]
    inserted = 0
    skipped = 0

    for text in normalized:
        exists = session.exec(
            select(Word).where(Word.word_text == text, Word.language == language,
                               Word.owner_user_id == owner_user_id)
        ).first()
        if exists:
            skipped += 1
            continue
        session.add(Word(word_text=text, language=language, owner_user_id=owner_user_id))
        inserted += 1

    session.commit()
    return {"language": language, "inserted": inserted, "skipped": skipped, "total": len(words)}


def list_words(session: Session, language: str, limit: int, offset: int, owner_user_id: int | None = None) -> dict:
    language = normalize_language(language)
    statement = select(Word).where(Word.language == language,
                                   (Word.owner_user_id == owner_user_id) |
                                   ((Word.owner_user_id.is_(None)) & Word.word_text.in_(set().union(*SYSTEM_WORDS.values())))).order_by(Word.word_id)
    all_words = session.exec(statement).all()
    words = all_words[offset : offset + limit]
    return {
        "items": [{"id": word.word_id, "word": word.word_text, "language": word.language} for word in words],
        "limit": limit,
        "offset": offset,
        "total": len(all_words),
    }
