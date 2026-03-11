from app.database import Base, engine
from app.routers import bookmarks, collections, users
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bookmark Curator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])
app.include_router(collections.router, prefix="/collections", tags=["collections"])
app.include_router(users.router, prefix="/users", tags=["users"])
