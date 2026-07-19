from fastapi import FastAPI
from app.api.v1 import words, stories, vocabularies, auth, stats
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.models import Word
from app.services.common import SYSTEM_WORDS
from app.core.redis import redis_status
from sqlmodel import SQLModel, Session, select
from sqlalchemy import text
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(words.router, prefix="/api/v1")
app.include_router(stories.router, prefix="/api/v1")
app.include_router(vocabularies.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")


def ensure_sqlite_schema():
    """Add auth columns to the existing MVP SQLite database without losing data."""
    if not str(engine.url).startswith("sqlite"):
        return
    with engine.begin() as connection:
        user_columns = {row[1] for row in connection.execute(text("PRAGMA table_info(user)"))}
        for name, definition in {
            "password_hash": "VARCHAR",
            "google_sub": "VARCHAR",
            "display_name": "VARCHAR",
            "deleted_at": "DATETIME",
        }.items():
            if name not in user_columns:
                connection.execute(text(f"ALTER TABLE user ADD COLUMN {name} {definition}"))
        word_columns = {row[1] for row in connection.execute(text("PRAGMA table_info(word)"))}
        if "owner_user_id" not in word_columns:
            connection.execute(text("ALTER TABLE word ADD COLUMN owner_user_id INTEGER"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_user_google_sub ON user (google_sub)"))


@app.on_event("startup")
def seed_builtin_words():
    SQLModel.metadata.create_all(engine)
    ensure_sqlite_schema()
    builtin = SYSTEM_WORDS
    with Session(engine) as session:
        for language, words in builtin.items():
            for text in words:
                if not session.exec(select(Word).where(Word.word_text == text, Word.language == language, Word.owner_user_id.is_(None))).first():
                    session.add(Word(word_text=text, language=language))
        session.commit()


@app.get("/health")
def health():
    return {"status": "ok", "redis": redis_status()}
