from app.config import settings
from app.database import Base, engine
from app.routers import bookmarks, collections, users
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Markit API",
    # API docs expose the full surface area; only enabled explicitly (ENABLE_DOCS=true).
    docs_url="/docs" if settings.enable_docs else None,
    redoc_url="/redoc" if settings.enable_docs else None,
    openapi_url="/openapi.json" if settings.enable_docs else None,
)

# Custom header the frontend always sends. Browsers can't attach it cross-origin
# without a CORS preflight, which only succeeds for allowed origins. This blocks
# CSRF on cookie-authenticated requests even if SameSite is bypassed.
CSRF_HEADER = "X-Requested-With"
CSRF_VALUE = "markit"
_UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


@app.middleware("http")
async def require_csrf_header(request: Request, call_next):
    if request.method in _UNSAFE_METHODS and request.headers.get(CSRF_HEADER) != CSRF_VALUE:
        return JSONResponse(status_code=403, content={"detail": "Missing CSRF header"})
    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    if settings.cookie_secure:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # explicit list, never "*" with credentials
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", CSRF_HEADER],
)

app.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])
app.include_router(collections.router, prefix="/collections", tags=["collections"])
app.include_router(users.router, prefix="/users", tags=["users"])
