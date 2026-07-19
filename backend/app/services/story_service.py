import re
from datetime import datetime, timezone

from sqlmodel import Session, func, select

from app.models.story import Story
from app.models.story_word import StoryWord
from app.models.word import Word
from app.core.languages import normalize_language
from app.services.common import SYSTEM_WORDS


def _tokens(text: str) -> set[str]:
    return {token.lower() for token in re.findall(r"[\wÀ-ÿ一-鿿]+", text)}


def _fallback_story(language: str, words: list[str], difficulty: str, style: str, starter: str | None) -> str:
    # Deterministic fallback keeps the product usable without an external LLM.
    # A provider can replace this function later without changing the API.
    opening = starter.strip() if starter and starter.strip() else {
        "en": "On a quiet morning,",
        "sv": "En lugn morgon",
        "zh": "一个安静的早晨，",
    }.get(language, "One day,")
    tone = {
        "joke": "something unexpectedly funny happened",
        "romance": "two friends discovered a tender secret",
        "science": "a curious experiment changed the day",
        "fantasy": "a small adventure began",
    }.get(style.lower(), "a memorable adventure began")
    return f"{opening} {tone}. " + " ".join(
        f"The word {word} became part of the story, and the characters used {word} in a new situation." for word in words
    ) + f" The short {difficulty} lesson ended with a smile."


def generate_story(session: Session, language: str, words: list[str], user_id: int,
                   wordcount: int | None = None, difficulty: str | None = None,
                   style: str | None = None, startwith: str | None = None) -> Story:
    language = normalize_language(language)
    selected = list(dict.fromkeys(word.strip().lower() for word in words if word.strip()))
    if not selected:
        raise ValueError("words must contain at least one non-empty word")
    if wordcount is not None:
        selected = selected[:wordcount]
    content = _fallback_story(language, selected, difficulty or "A2", style or "joke", startwith)
    missing = [word for word in selected if word not in _tokens(content) and word not in content.lower()]
    if missing:
        raise ValueError(f"generated story did not include: {', '.join(missing)}")

    story = Story(user_id=user_id, language=language, content=content,
                  word_count=len(_tokens(content)), created_at=datetime.now(timezone.utc))
    session.add(story)
    session.flush()
    for text in selected:
        word = session.exec(select(Word).where(Word.word_text == text, Word.language == language,
                                               (Word.owner_user_id == user_id) |
                                               ((Word.owner_user_id.is_(None)) & Word.word_text.in_(set().union(*SYSTEM_WORDS.values())))).order_by(Word.owner_user_id.desc())).first()
        if not word:
            word = Word(word_text=text, language=language, owner_user_id=user_id)
            session.add(word)
            session.flush()
        session.add(StoryWord(story_id=story.story_id, word_id=word.word_id))
    session.commit()
    session.refresh(story)
    return story


def list_stories(session: Session, user_id: int, language: str | None, limit: int, offset: int) -> dict:
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    statement = select(Story).where(Story.user_id == user_id)
    if language:
        statement = statement.where(Story.language == normalize_language(language))
    total = session.exec(select(func.count()).select_from(statement.subquery())).one()
    stories = session.exec(statement.order_by(Story.created_at.desc()).limit(limit).offset(offset)).all()
    return {"items": [{"story_id": s.story_id, "user_id": str(user_id), "language": s.language,
                         "content": s.content, "word_count": s.word_count, "created_at": s.created_at} for s in stories],
            "limit": limit, "offset": offset, "total": total}


def get_story(session: Session, story_id: int, user_id: int) -> Story | None:
    return session.exec(select(Story).where(Story.story_id == story_id, Story.user_id == user_id)).first()


def get_story_words(session: Session, story_id: int, user_id: int) -> list[dict]:
    statement = select(Word).join(StoryWord, StoryWord.word_id == Word.word_id).join(Story, Story.story_id == StoryWord.story_id).where(
        StoryWord.story_id == story_id, Story.user_id == user_id, Word.language == Story.language)
    return [{"story_id": story_id, "word": word.word_text, "word_id": word.word_id, "language": word.language} for word in session.exec(statement).all()]
