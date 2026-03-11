from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


class UserOut(BaseModel):
    id: int
    email: str
    name: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
