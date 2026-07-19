from datetime import timedelta

from sqlmodel import Session

from conftest import engine
from app.services.streak_service import get_streak_summary, record_learning_activity, utc_today


def test_streak_reaches_five_day_goal(client, auth_headers):
    user = client.get("/api/v1/auth/me", headers=auth_headers).json()
    today = utc_today()

    with Session(engine) as session:
        for days_ago in range(5):
            record_learning_activity(session, user["user_id"], today - timedelta(days=days_ago))

        summary = get_streak_summary(session, user["user_id"])

    assert summary["current_streak"] == 5
    assert summary["longest_streak"] == 5
    assert summary["goal_progress"] == 5
    assert summary["goal_reached"] is True
    assert summary["today_completed"] is True


def test_streak_activity_is_idempotent_per_day(client, auth_headers):
    first = client.post("/api/v1/stats/activity", headers=auth_headers)
    second = client.post("/api/v1/stats/activity", headers=auth_headers)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["current_streak"] == 1
    assert second.json()["current_streak"] == 1
    assert second.json()["today_completed"] is True
