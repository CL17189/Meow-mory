# backend/app/db/session.py
from sqlmodel import SQLModel, create_engine, Session
#from contextlib import contextmanager
from typing import Generator
import os


# PostgreSQL is selected by setting MEOWMORY_DATABASE_URL (or DATABASE_URL).
# SQLite remains a local fallback so tests and a fresh checkout still work.
DATABASE_PATH = os.getenv("MEOWMORY_DATABASE_PATH", os.path.join(os.path.dirname(__file__), "../../dev.db"))
DATABASE_URL = os.getenv("MEOWMORY_DATABASE_URL") or os.getenv("DATABASE_URL") or f"sqlite:///{DATABASE_PATH}"


# 创建引擎
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,
)


# 会话生成器，用作依赖注入
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

# 方便在 shell / scripts 里直接使用
def create_db_and_tables():
    from backend.app.models import user, word, story, review_log, story_word, learning_day
    SQLModel.metadata.create_all(engine)
