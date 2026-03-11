from datetime import datetime

from pydantic import BaseModel


class CollectionCreate(BaseModel):
    name: str


class CollectionUpdate(BaseModel):
    name: str


class CollectionOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    bookmark_count: int = 0

    class Config:
        from_attributes = True
