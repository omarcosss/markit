import bcrypt
from app.database import get_db
from app.dependencies.auth import (
    ACCESS_COOKIE_NAME,
    clear_auth_cookie,
    get_current_user,
    hash_password,
    set_auth_cookie,
    user_from_token,
    verify_password,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services.rate_limit import login_by_email, login_by_ip, register_by_ip
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter()

# Used when the e-mail is unknown, so a login costs the same bcrypt work either way
# and response time can't reveal which accounts exist.
_DUMMY_HASH = bcrypt.hashpw(b"markit-timing-placeholder", bcrypt.gensalt()).decode()


class PasswordConfirmation(BaseModel):
    current_password: str = Field(min_length=1)


class ConfirmedUserUpdate(UserUpdate, PasswordConfirmation):
    """Profile changes require the current password."""


class RegistrationReceipt(BaseModel):
    detail: str


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _confirm_password(user: User, password: str) -> None:
    # Counts against the same budget as login, so a stolen session can't brute-force it.
    login_by_email.hit(f"confirm:{user.id}")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Current password is incorrect")


@router.post("/register", response_model=RegistrationReceipt, status_code=201)
def register(
    data: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    register_by_ip.hit(_client_ip(request))
    # Hash first in every case so timing doesn't reveal whether the e-mail exists.
    hashed = hash_password(data.password)
    taken = db.query(User).filter(func.lower(User.email) == data.email).first() is not None
    if not taken:
        db.add(User(email=data.email, hashed_password=hashed, name=data.name))
        db.commit()
    # Same answer whether or not the e-mail was already registered.
    return {"detail": "Account created. Sign in to continue."}


@router.post("/login", response_model=UserOut)
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    email = form_data.username.strip().lower()
    login_by_ip.hit(_client_ip(request))
    login_by_email.hit(email)

    user = db.query(User).filter(func.lower(User.email) == email).first()
    hashed = user.hashed_password if user else _DUMMY_HASH
    password_ok = verify_password(form_data.password, hashed)
    if user is None or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    login_by_email.reset(email)
    set_auth_cookie(response, user)
    return user


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    access_token: str | None = Cookie(default=None, alias=ACCESS_COOKIE_NAME),
    db: Session = Depends(get_db),
):
    # Bumping token_version revokes every token issued so far for this user,
    # including sessions on other devices.
    user = user_from_token(access_token, db)
    if user is not None:
        user.token_version = (user.token_version or 0) + 1
        db.commit()
    clear_auth_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    data: ConfirmedUserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _confirm_password(current_user, data.current_password)
    changes = data.model_dump(exclude_unset=True, exclude={"current_password"})
    if changes.get("email"):
        conflict = (
            db.query(User)
            .filter(func.lower(User.email) == changes["email"], User.id != current_user.id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=400, detail="Email already in use")
    for field, value in changes.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=204)
def delete_me(
    data: PasswordConfirmation,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _confirm_password(current_user, data.current_password)
    db.delete(current_user)
    db.commit()
    clear_auth_cookie(response)
