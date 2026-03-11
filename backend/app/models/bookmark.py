from datetime import datetime

from app.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True)
    url = Column(String, nullable=False)
    title = Column(String)
    description = Column(String)
    thumbnail = Column(String)  # OG image URL
    favicon = Column(String)  # favicon URL
    domain = Column(String)  # e.g. "github.com"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    collection = relationship("Collection", back_populates="bookmarks")
