from datetime import datetime

from pydantic import BaseModel


class ScrapeRequest(BaseModel):
    url: str


class ScrapeResult(BaseModel):
    url: str
    title: str | None
    description: str | None
    thumbnail: str | None
    favicon: str | None
    domain: str | None


class BookmarkCreate(BaseModel):
    url: str
    title: str | None = None
    description: str | None = None
    thumbnail: str | None = None
    favicon: str | None = None
    domain: str | None = None
    collection_id: int | None = None


class BookmarkUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    collection_id: int | None = None


class BookmarkOut(BaseModel):
    id: int
    url: str
    title: str | None
    description: str | None
    thumbnail: str | None
    favicon: str | None
    domain: str | None
    collection_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True
