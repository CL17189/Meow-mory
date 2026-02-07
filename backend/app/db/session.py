# backend/app/db/session.py
from sqlmodel import SQLModel, create_engine, Session
#from contextlib import contextmanager
from typing import Generator
import os


# 数据库 URL，可以根据环境变量切换
DATABASE_PATH = "/Users/lisa/Desktop/meowmory/backend/dev.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"


# 创建引擎
engine = create_engine(
    DATABASE_URL, 
    echo=True,        # 开发环境打印 SQL
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)


# 会话生成器，用作依赖注入
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

# 方便在 shell / scripts 里直接使用
def create_db_and_tables():
    from backend.app.models import user, word, story, review_log, story_word
    SQLModel.metadata.create_all(engine)
