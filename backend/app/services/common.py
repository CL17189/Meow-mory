from sqlmodel import Session, select

from app.models.user import User

SYSTEM_WORDS = {
    "en": {"water", "book", "friend", "city", "future", "learn", "story", "curious"},
    "sv": {"hus", "bok", "vatten", "sol", "arbete", "tid", "människa", "stad", "mat"},
}


def is_system_word(language: str, text: str) -> bool:
    return text in SYSTEM_WORDS.get(language, set())

def find_user_by_email(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email.strip().lower(), User.deleted_at.is_(None))).first()
