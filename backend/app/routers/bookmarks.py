import asyncio

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.bookmark import Bookmark
from app.models.collection import Collection
from app.models.user import User
from app.schemas.bookmark import (
    BookmarkCreate,
    BookmarkOut,
    BookmarkUpdate,
    ScrapeRequest,
    ScrapeResult,
)
from app.services.rate_limit import RateLimiter
from app.services.scraper import UnsafeURLError, fetch_metadata, fallback_metadata
from app.services.url import domain_from_url, favicon_for_domain
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()

SCRAPE_DEADLINE_SECONDS = 10
# Each scrape makes outbound requests, so it is limited per user.
scrape_by_user = RateLimiter(30, 60, "Too many lookups. Wait a minute and try again.")


def _assert_own_collection(db: Session, user: User, collection_id: int | None) -> None:
    """A bookmark may only be placed in a collection owned by the same user."""
    if collection_id is None:
        return
    owned = (
        db.query(Collection.id)
        .filter(Collection.id == collection_id, Collection.user_id == user.id)
        .first()
    )
    if not owned:
        raise HTTPException(status_code=400, detail="Collection not found")


@router.post("/scrape", response_model=ScrapeResult)
async def scrape_url(
    data: ScrapeRequest,
    current_user: User = Depends(get_current_user),
):
    scrape_by_user.hit(str(current_user.id))
    try:
        metadata = await asyncio.wait_for(fetch_metadata(data.url), timeout=SCRAPE_DEADLINE_SECONDS)
    except UnsafeURLError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except asyncio.TimeoutError:
        # Slow page: save the bookmark with domain-only metadata instead of failing.
        metadata = fallback_metadata(data.url)
    return {"url": data.url, **metadata}


@router.post("/", response_model=BookmarkOut, status_code=201)
def create_bookmark(
    data: BookmarkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_own_collection(db, current_user, data.collection_id)
    bookmark = Bookmark(**data.model_dump(), user_id=current_user.id)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark


@router.get("/", response_model=list[BookmarkOut])
def list_bookmarks(
    collection_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Bookmark).filter(Bookmark.user_id == current_user.id)
    if collection_id is not None:
        query = query.filter(Bookmark.collection_id == collection_id)
    return query.order_by(Bookmark.created_at.desc()).all()


@router.get("/{id}", response_model=BookmarkOut)
def get_bookmark(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookmark = (
        db.query(Bookmark)
        .filter(Bookmark.id == id, Bookmark.user_id == current_user.id)
        .first()
    )
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark


@router.patch("/{id}", response_model=BookmarkOut)
def update_bookmark(
    id: int,
    data: BookmarkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookmark = (
        db.query(Bookmark)
        .filter(Bookmark.id == id, Bookmark.user_id == current_user.id)
        .first()
    )
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    updates = data.model_dump(exclude_unset=True)
    if "collection_id" in updates:
        _assert_own_collection(db, current_user, updates["collection_id"])
    for field, value in updates.items():
        setattr(bookmark, field, value)
    if "url" in updates:
        bookmark.domain = domain_from_url(bookmark.url)
        bookmark.favicon = favicon_for_domain(bookmark.domain)
    db.commit()
    db.refresh(bookmark)
    return bookmark


@router.delete("/{id}", status_code=204)
def delete_bookmark(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookmark = (
        db.query(Bookmark)
        .filter(Bookmark.id == id, Bookmark.user_id == current_user.id)
        .first()
    )
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.delete(bookmark)
    db.commit()
