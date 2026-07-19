from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from app.core.auth import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.services.streak_service import get_streak_summary, record_learning_activity


router = APIRouter(prefix="/stats", tags=["stats"])


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    goal_days: int
    goal_progress: int
    goal_reached: bool
    today_completed: bool
    active_dates: list[date]
    last_activity_date: date | None


@router.get("/streak", response_model=StreakResponse)
def get_streak(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return get_streak_summary(session, user.user_id)


@router.post("/activity", response_model=StreakResponse)
def mark_learning_activity(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    record_learning_activity(session, user.user_id)
    return get_streak_summary(session, user.user_id)
