from datetime import datetime, timezone
import os

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlmodel import Session, select

from app.core.auth import create_access_token, get_current_user, hash_password, normalize_email, verify_password
from app.core.languages import DEFAULT_LANGUAGE, normalize_language
from app.db.session import get_session
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(default=None, max_length=80)
    preferred_language: str = DEFAULT_LANGUAGE

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("preferred_language")
    @classmethod
    def validate_preferred_language(cls, value: str) -> str:
        return normalize_language(value)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return value.strip().lower()


class GoogleLoginRequest(BaseModel):
    credential: str = Field(min_length=20)


class UserResponse(BaseModel):
    user_id: int
    email: str
    display_name: str | None = None
    preferred_language: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


def user_response(user: User) -> UserResponse:
    return UserResponse(user_id=user.user_id, email=user.email, display_name=user.display_name, preferred_language=user.preferred_language)


def auth_response(user: User) -> AuthResponse:
    return AuthResponse(access_token=create_access_token(user), user=user_response(user))


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, session: Session = Depends(get_session)):
    email = normalize_email(str(payload.email))
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(409, detail={"code": "EMAIL_TAKEN", "message": "Email is already registered"})
    user = User(email=email, password_hash=hash_password(payload.password), display_name=payload.display_name or email.split("@")[0], preferred_language=payload.preferred_language)
    session.add(user)
    session.commit()
    session.refresh(user)
    return auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == normalize_email(str(payload.email)), User.deleted_at.is_(None))).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, detail={"code": "INVALID_CREDENTIALS", "message": "Email or password is incorrect"})
    return auth_response(user)


@router.post("/google", response_model=AuthResponse)
def google_login(payload: GoogleLoginRequest, session: Session = Depends(get_session)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(503, detail={"code": "GOOGLE_NOT_CONFIGURED", "message": "Google login is not configured"})
    try:
        from google.auth.transport import requests
        from google.oauth2 import id_token
        claims = id_token.verify_oauth2_token(payload.credential, requests.Request(), client_id)
        if claims.get("iss") not in {"accounts.google.com", "https://accounts.google.com"} or not claims.get("email_verified"):
            raise ValueError("Untrusted Google identity")
        google_sub = claims["sub"]
        email = normalize_email(claims["email"])
    except Exception as exc:
        raise HTTPException(401, detail={"code": "INVALID_GOOGLE_TOKEN", "message": "Google identity could not be verified"}) from exc

    user = session.exec(select(User).where(User.google_sub == google_sub, User.deleted_at.is_(None))).first()
    if not user:
        user = session.exec(select(User).where(User.email == email, User.deleted_at.is_(None))).first()
    if not user:
        user = User(email=email, google_sub=google_sub, display_name=claims.get("name") or email.split("@")[0])
        session.add(user)
    else:
        user.google_sub = google_sub
        user.display_name = user.display_name or claims.get("name")
    session.commit()
    session.refresh(user)
    return auth_response(user)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user_response(user)


class UpdateUserRequest(BaseModel):
    display_name: str | None = Field(default=None, max_length=80)
    preferred_language: str | None = None

    @field_validator("display_name", mode="before")
    @classmethod
    def normalize_display_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        return value or None

    @field_validator("preferred_language")
    @classmethod
    def validate_preferred_language(cls, value: str | None) -> str | None:
        return normalize_language(value) if value is not None else None


@router.patch("/me", response_model=UserResponse)
def update_me(payload: UpdateUserRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.preferred_language is not None:
        user.preferred_language = payload.preferred_language
    session.add(user)
    session.commit()
    session.refresh(user)
    return user_response(user)


@router.post("/logout")
def logout(user: User = Depends(get_current_user)):
    # JWT is stateless; the client discards its token. This endpoint provides a stable logout contract.
    return {"ok": True}


@router.delete("/me", status_code=204)
def delete_account(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    from app.models.review_log import ReviewLog
    from app.models.story import Story
    from app.models.story_word import StoryWord
    from app.models.word import Word
    from app.models.learning_day import LearningDay
    story_ids = [story.story_id for story in session.exec(select(Story).where(Story.user_id == user.user_id)).all()]
    if story_ids:
        session.query(StoryWord).filter(StoryWord.story_id.in_(story_ids)).delete(synchronize_session=False)
        session.query(Story).filter(Story.story_id.in_(story_ids)).delete(synchronize_session=False)
    session.query(ReviewLog).filter(ReviewLog.user_id == user.user_id).delete(synchronize_session=False)
    session.query(Word).filter(Word.owner_user_id == user.user_id).delete(synchronize_session=False)
    session.query(LearningDay).filter(LearningDay.user_id == user.user_id).delete(synchronize_session=False)
    session.query(User).filter(User.user_id == user.user_id).delete(synchronize_session=False)
    session.commit()
