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
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool

#打印一下当前路径
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.session import get_session

TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
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

    app.dependency_overrides.clear()
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def auth_headers(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "learner@example.com", "password": "correct-horse-battery"},
    )
    assert response.status_code == 201
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
