from datetime import datetime

from app.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    # Bumped on logout; tokens carrying an older value are rejected.
    token_version = Column(Integer, nullable=False, default=0, server_default="0")
    created_at = Column(DateTime, default=datetime.utcnow)
