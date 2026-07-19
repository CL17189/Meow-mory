import base64
import hashlib
import hmac
import json
import os
import secrets
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.user import User

JWT_SECRET = os.getenv("MEOWMORY_JWT_SECRET", "dev-only-change-me")
JWT_TTL_SECONDS = int(os.getenv("MEOWMORY_JWT_TTL_SECONDS", str(60 * 60 * 24 * 7)))
bearer = HTTPBearer(auto_error=False)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 240_000)
    return f"pbkdf2_sha256$240000${_encode(salt)}${_encode(digest)}"


def verify_password(password: str, stored: str | None) -> bool:
    if not stored:
        return False
    try:
        algorithm, rounds, salt, digest = stored.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), _decode(salt), int(rounds))
        return hmac.compare_digest(candidate, _decode(digest))
    except (ValueError, TypeError):
        return False


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def create_access_token(user: User) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": str(user.user_id), "email": user.email, "exp": int(time.time()) + JWT_TTL_SECONDS}
    encoded_header = _encode(json.dumps(header, separators=(",", ":")).encode())
    encoded_payload = _encode(json.dumps(payload, separators=(",", ":")).encode())
    message = f"{encoded_header}.{encoded_payload}".encode()
    signature = _encode(hmac.new(JWT_SECRET.encode(), message, hashlib.sha256).digest())
    return f"{encoded_header}.{encoded_payload}.{signature}"


def decode_access_token(token: str) -> dict:
    try:
        header, payload, signature = token.split(".")
        message = f"{header}.{payload}".encode()
        expected = _encode(hmac.new(JWT_SECRET.encode(), message, hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid signature")
        data = json.loads(_decode(payload))
        if int(data.get("exp", 0)) <= int(time.time()):
            raise ValueError("Expired token")
        return data
    except (ValueError, TypeError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), session: Session = Depends(get_session)) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    payload = decode_access_token(credentials.credentials)
    user = session.exec(select(User).where(User.user_id == int(payload["sub"]), User.deleted_at.is_(None))).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
