from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.bookmark import Bookmark
from app.models.collection import Collection
from app.models.user import User
from app.schemas.collection import CollectionCreate, CollectionOut, CollectionUpdate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=list[CollectionOut])
def list_collections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collections = (
        db.query(Collection)
        .filter(Collection.user_id == current_user.id)
        .all()
    )
    result = []
    for col in collections:
        count = (
            db.query(func.count(Bookmark.id))
            .filter(
                Bookmark.collection_id == col.id,
                Bookmark.user_id == current_user.id,
            )
            .scalar()
        )
        result.append(CollectionOut(
            id=col.id,
            name=col.name,
            created_at=col.created_at,
            bookmark_count=count or 0,
        ))
    return result


@router.post("/", response_model=CollectionOut, status_code=201)
def create_collection(
    data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection = Collection(name=data.name, user_id=current_user.id)
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return CollectionOut(
        id=collection.id,
        name=collection.name,
        created_at=collection.created_at,
        bookmark_count=0,
    )


@router.patch("/{id}", response_model=CollectionOut)
def update_collection(
    id: int,
    data: CollectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection = (
        db.query(Collection)
        .filter(Collection.id == id, Collection.user_id == current_user.id)
        .first()
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    collection.name = data.name
    db.commit()
    db.refresh(collection)
    count = (
        db.query(func.count(Bookmark.id))
        .filter(Bookmark.collection_id == id, Bookmark.user_id == current_user.id)
        .scalar()
    )
    return CollectionOut(
        id=collection.id,
        name=collection.name,
        created_at=collection.created_at,
        bookmark_count=count or 0,
    )


@router.delete("/{id}", status_code=204)
def delete_collection(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection = (
        db.query(Collection)
        .filter(Collection.id == id, Collection.user_id == current_user.id)
        .first()
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    # Detach only this user's bookmarks from the collection
    db.query(Bookmark).filter(
        Bookmark.collection_id == id,
        Bookmark.user_id == current_user.id,
    ).update({"collection_id": None})
    db.delete(collection)
    db.commit()
