'''import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session

from app.main import app
from app.db.session import get_session
TEST_DATABASE_URL = "sqlite://"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
def get_test_session():
    with Session(engine) as session:
        yield session
@pytest.fixture(scope="function")
def client():
    SQLModel.metadata.create_all(engine)

    app.dependency_overrides[get_session] = get_test_session

    with TestClient(app) as c:
        yield c

    SQLModel.metadata.drop_all(engine)'''

import pytest
from fastapi.testclient import TestClient
from sqlmodel import create_engine, Session

#打印一下当前路径
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.session import get_session

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]  # meowmory/
DB_PATH = BASE_DIR / "backend" / "dev.db"

TEST_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

def get_test_session():
    with Session(engine) as session:
        yield session

@pytest.fixture(scope="function")
def client():
    app.dependency_overrides[get_session] = get_test_session

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
