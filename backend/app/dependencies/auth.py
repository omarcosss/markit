from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from app.config import settings
from app.database import get_db
from app.models.user import User
from fastapi import Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

ACCESS_COOKIE_NAME = "access_token"
JWT_ALGORITHM = "HS256"
_CREDENTIALS_ERROR = "Could not validate credentials"


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def _token_version(user: User) -> int:
    return user.token_version or 0


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "tv": _token_version(user),
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, user: User) -> None:
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=create_access_token(user),
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,  # not readable from JavaScript
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


def user_from_token(token: str | None, db: Session) -> User | None:
    """Return the user for a valid, unrevoked token, otherwise None."""
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "iat", "exp"]},
        )
        user_id = int(payload["sub"])
        # Tokens issued before token_version existed have no "tv" claim: treat as 0.
        token_version = int(payload.get("tv", 0))
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        return None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        return None
    if token_version != _token_version(user):
        return None  # revoked by logout
    return user


def get_current_user(
    access_token: str | None = Cookie(default=None, alias=ACCESS_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User:
    user = user_from_token(access_token, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=_CREDENTIALS_ERROR,
        )
    return user
