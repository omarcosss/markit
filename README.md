# Markit

Save and organise your bookmarks. Paste a URL and Markit scrapes the title, description, and thumbnail automatically. Group bookmarks into collections and access them from any browser.

## Tech Stack

**Frontend** — React 19, React Router 7, TypeScript, Vite, Tailwind CSS v4, Sonner, Iconoir
**Backend** — FastAPI, SQLAlchemy (SQLite), JWT auth (python-jose), bcrypt, BeautifulSoup4 + HTTPX

## Project Structure

```
markit/
├── backend/              # FastAPI API
│   ├── app/
│   │   ├── models/       # SQLAlchemy models (User, Bookmark, Collection)
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── routers/      # Endpoint handlers
│   │   ├── services/     # Business logic (scraping)
│   │   └── dependencies/ # Auth (JWT) and DB session
│   └── requirements.txt
└── markit/               # React frontend
    └── src/
        ├── components/   # UI components
        ├── pages/        # Route-level pages
        ├── services/     # API client functions
        ├── lib/          # Utilities and event bus
        └── types/        # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

```bash
uvicorn app.main:app --reload
# API running at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### Frontend

```bash
cd markit
npm install
```

Create `markit/.env`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
# App running at http://localhost:5173
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/register` | Create an account |
| `POST` | `/users/login` | Sign in and receive a JWT |
| `GET` | `/users/me` | Get current user profile |
| `GET` | `/bookmarks/` | List bookmarks |
| `POST` | `/bookmarks/scrape` | Scrape metadata from a URL |
| `POST` | `/bookmarks/` | Save a bookmark |
| `DELETE` | `/bookmarks/{id}` | Delete a bookmark |
| `GET` | `/collections/` | List collections |
| `POST` | `/collections/` | Create a collection |
| `DELETE` | `/collections/{id}` | Delete a collection |
