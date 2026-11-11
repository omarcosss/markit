from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

PASSWORD_MIN = 8
# bcrypt only uses the first 72 bytes; refuse longer passwords instead of silently truncating.
PASSWORD_MAX_BYTES = 72


def _check_password(v: str) -> str:
    if len(v.encode()) > PASSWORD_MAX_BYTES:
        raise ValueError(f"Password must be at most {PASSWORD_MAX_BYTES} bytes")
    return v


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=PASSWORD_MIN)
    name: str | None = Field(default=None, max_length=100)

    @field_validator("email", mode="before")
    @classmethod
    def _lower_email(cls, v):
        return v.strip().lower() if isinstance(v, str) else v

    @field_validator("password")
    @classmethod
    def _password_length(cls, v: str) -> str:
        return _check_password(v)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = None

    @field_validator("email", mode="before")
    @classmethod
    def _lower_email(cls, v):
        return v.strip().lower() if isinstance(v, str) else v


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=PASSWORD_MIN)

    @field_validator("new_password")
    @classmethod
    def _password_length(cls, v: str) -> str:
        return _check_password(v)


class UserOut(BaseModel):
    id: int
    email: str
    name: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
