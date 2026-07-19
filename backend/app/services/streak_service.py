from datetime import date, datetime, timedelta, timezone

from sqlmodel import Session, select

from app.models.learning_day import LearningDay


STREAK_GOAL_DAYS = 5


def utc_today() -> date:
    return datetime.now(timezone.utc).date()


def record_learning_activity(session: Session, user_id: int, activity_date: date | None = None) -> LearningDay:
    """Record one learning action without creating duplicate calendar days."""
    target_date = activity_date or utc_today()
    learning_day = session.exec(
        select(LearningDay).where(
            LearningDay.user_id == user_id,
            LearningDay.activity_date == target_date,
        )
    ).first()
    now = datetime.now(timezone.utc)
    if learning_day:
        learning_day.activity_count += 1
        learning_day.last_activity_at = now
    else:
        learning_day = LearningDay(
            user_id=user_id,
            activity_date=target_date,
            activity_count=1,
            last_activity_at=now,
        )
        session.add(learning_day)
    session.commit()
    session.refresh(learning_day)
    return learning_day


def _run_length(dates: set[date], start: date) -> int:
    if start not in dates:
        return 0
    length = 0
    cursor = start
    while cursor in dates:
        length += 1
        cursor -= timedelta(days=1)
    return length


def get_streak_summary(session: Session, user_id: int) -> dict:
    today = utc_today()
    dates = {
        item.activity_date
        for item in session.exec(select(LearningDay).where(LearningDay.user_id == user_id)).all()
        if item.activity_date <= today
    }
    current_start = today if today in dates else today - timedelta(days=1)
    current_streak = _run_length(dates, current_start)

    longest_streak = 0
    for activity_date in dates:
        if activity_date + timedelta(days=1) not in dates:
            longest_streak = max(longest_streak, _run_length(dates, activity_date))

    recent_dates = sorted(item.isoformat() for item in dates if item >= today - timedelta(days=6))
    last_activity_date = max(dates).isoformat() if dates else None
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "goal_days": STREAK_GOAL_DAYS,
        "goal_progress": min(current_streak, STREAK_GOAL_DAYS),
        "goal_reached": current_streak >= STREAK_GOAL_DAYS,
        "today_completed": today in dates,
        "active_dates": recent_dates,
        "last_activity_date": last_activity_date,
    }
