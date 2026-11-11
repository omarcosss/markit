from datetime import datetime

from app.services.url import clean_url, validate_http_url
from pydantic import BaseModel, Field, field_validator

TITLE_MAX = 512
DESCRIPTION_MAX = 1024
URL_MAX = 2048


def _optional_http_url(v: str | None) -> str | None:
    if v is None or v == "":
        return None
    return validate_http_url(v)


class ScrapeRequest(BaseModel):
    url: str = Field(max_length=URL_MAX)

    @field_validator("url", mode="before")
    @classmethod
    def _clean_url(cls, v):
        return clean_url(v) if isinstance(v, str) else v


class ScrapeResult(BaseModel):
    url: str
    title: str | None
    description: str | None
    thumbnail: str | None
    favicon: str | None
    domain: str | None


class BookmarkCreate(BaseModel):
    url: str = Field(max_length=URL_MAX)
    title: str | None = Field(default=None, max_length=TITLE_MAX)
    description: str | None = Field(default=None, max_length=DESCRIPTION_MAX)
    thumbnail: str | None = Field(default=None, max_length=URL_MAX)
    favicon: str | None = Field(default=None, max_length=URL_MAX)
    domain: str | None = Field(default=None, max_length=255)
    collection_id: int | None = None

    @field_validator("url", mode="before")
    @classmethod
    def _clean_url(cls, v):
        return clean_url(v) if isinstance(v, str) else v

    @field_validator("thumbnail", "favicon", mode="before")
    @classmethod
    def _clean_images(cls, v):
        return _optional_http_url(v)


class BookmarkUpdate(BaseModel):
    url: str | None = Field(default=None, max_length=URL_MAX)
    title: str | None = Field(default=None, max_length=TITLE_MAX)
    description: str | None = Field(default=None, max_length=DESCRIPTION_MAX)
    collection_id: int | None = None

    @field_validator("url", mode="before")
    @classmethod
    def _clean_url(cls, v):
        if v is None:
            raise ValueError("url cannot be null")
        return clean_url(v) if isinstance(v, str) else v


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
