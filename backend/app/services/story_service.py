from datetime import datetime, timezone
from sqlmodel import Session

from app.models.story import Story
from app.core.llm_client import LLMClient
def generate_story(
    session: Session,
    language: str,
    words: list[str],
    user_id: str,
    wordcount: int | None = None,
    difficulty: str | None = None,
    style: str | None = None,
    startwith: str | None = None,
) -> Story:
    
    llm_client = LLMClient(model="gemini-pro")
    res=llm_client.generate_story(lang=language,words=words,difficulty=difficulty,style=style,starter=startwith)

    content=res['story']

    story = Story(
        user_id=user_id,
        language=language,
        content=content,
        word_count=wordcount if res['status']=="pass" else 0,
        created_at=datetime.now(timezone.utc),
    )

    session.add(story)
    session.commit()
    session.refresh(story)

    return story


from sqlmodel import select, func
def list_stories(
    session: Session,
    user_id: str,
    language: str | None,
    limit: int,
    offset: int,
) -> dict:
    stmt = select(Story).where(Story.user_id == user_id)

    if language:
        stmt = stmt.where(Story.language == language)

    total = session.exec(
        select(func.count()).select_from(stmt.subquery())
    ).one()

    stories = session.exec(
        stmt.order_by(Story.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    return {
        "items": [
            {
                "story_id": s.story_id,
                "language": s.language,
                "content": s.content,
                "created_at": s.created_at,
            }
            for s in stories
        ],
        "limit": limit,
        "offset": offset,
        "total": total,
    }
