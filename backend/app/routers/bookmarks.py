from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.bookmark import Bookmark
from app.models.user import User
from app.schemas.bookmark import (
    BookmarkCreate,
    BookmarkOut,
    BookmarkUpdate,
    ScrapeRequest,
    ScrapeResult,
)
from app.services.scraper import fetch_metadata
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/scrape", response_model=ScrapeResult)
async def scrape_url(
    data: ScrapeRequest,
    current_user: User = Depends(get_current_user),
):
    metadata = await fetch_metadata(data.url)
    return {"url": data.url, **metadata}


@router.post("/", response_model=BookmarkOut, status_code=201)
def create_bookmark(
    data: BookmarkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bookmark, field, value)
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
