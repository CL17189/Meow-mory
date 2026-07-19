from datetime import datetime

from sqlmodel import Session

from app.db.session import engine
from app.services.story_service import generate_story
from app.core.redis import delete_pattern
from app.services.streak_service import record_learning_activity
from app.worker.celery_app import celery_app


@celery_app.task(bind=True, name="meowmory.generate_story")
def generate_story_task(self, payload: dict) -> dict:
    with Session(engine) as session:
        story = generate_story(
            session=session,
            language=payload["language"],
            words=payload["words"],
            user_id=int(payload["user_id"]),
            wordcount=payload.get("wordcount"),
            difficulty=payload.get("difficulty"),
            style=payload.get("style"),
            startwith=payload.get("startwith"),
        )
        record_learning_activity(session, int(payload["user_id"]))
        delete_pattern(f"meowmory:stories:{payload['user_id']}:*")
        return {
            "story_id": story.story_id,
            "user_id": str(payload["user_id"]),
            "language": story.language,
            "content": story.content,
            "word_count": story.word_count,
            "created_at": story.created_at.isoformat() if isinstance(story.created_at, datetime) else story.created_at,
        }
