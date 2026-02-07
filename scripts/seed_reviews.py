# scripts/seed_reviews.py
from datetime import datetime, timedelta, timezone
from backend.app.db.session import get_session
from backend.app.models import ReviewLog, User, Word
from sqlmodel import select

def main():
    with get_session() as session:
        user = session.exec(select(User)).first()
        words = session.exec(select(Word).limit(10)).all()

        now = datetime.now(timezone.utc)

        for i, w in enumerate(words):
            log = ReviewLog(
                user_id=user.user_id,
                word_id=w.word_id,
                reviewed_at=now - timedelta(days=i),
                next_review_at=now + timedelta(days=1),
                success=True
            )
            session.add(log)

        session.commit()
        print("Review logs seeded.")

if __name__ == "__main__":
    main()
