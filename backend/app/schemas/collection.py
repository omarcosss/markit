from datetime import datetime

from pydantic import BaseModel, Field


class CollectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class CollectionUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class CollectionOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    bookmark_count: int = 0

    class Config:
        from_attributes = True
