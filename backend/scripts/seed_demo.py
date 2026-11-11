"""Create (or recreate) a demo account with realistic bookmarks in the LOCAL database.

For local development only. Run from backend/:

    ./venv/bin/python scripts/seed_demo.py

Only the demo user (demo@example.com) is touched. The password is generated
per run and printed to the terminal; it is never written to a file.
"""

import asyncio
import os
import random
import secrets
import sys
from datetime import datetime, timedelta
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings  # noqa: E402  (loads .env like the app does)
from app.database import DATABASE_URL, SessionLocal  # noqa: E402
from app.dependencies.auth import hash_password  # noqa: E402
from app.models.bookmark import Bookmark  # noqa: E402
from app.models.collection import Collection  # noqa: E402
from app.models.user import User  # noqa: E402
from app.schemas.user import UserCreate  # noqa: E402
from app.services.scraper import fetch_metadata  # noqa: E402
from app.services.url import domain_from_url, favicon_for_domain  # noqa: E402
from sqlalchemy import func  # noqa: E402

EMAIL = "demo@example.com"
NAME = "Marina Duarte"
LOCAL_HOSTS = {"localhost", "127.0.0.1"}

# (url, fallback title, fallback description or None, days ago)
COLLECTIONS: list[tuple[str, list[tuple[str, str, str | None, int]]]] = [
    ("Design UI/UX", [
        ("https://www.figma.com", "Figma: the collaborative interface design tool", "Design, prototype and collaborate in one place.", 170),
        ("https://dribbble.com", "Dribbble - Discover the world's top designers", "Shots, portfolios and design inspiration.", 0),
        ("https://www.awwwards.com", "Awwwards - Website awards", None, 95),
        ("https://www.refactoringui.com", "Refactoring UI", "Tactics for designing UI without being a designer.", 60),
        ("https://lawsofux.com", "Laws of UX", "Psychology principles for better interface design.", 40),
        ("https://www.nngroup.com", "Nielsen Norman Group", "Research-based UX articles and courses.", 130),
        ("https://mobbin.com", "Mobbin - Real app UI screenshots", "Browse flows and screens from real products.", 5),
    ]),
    ("Design Systems e Tokens", [
        ("https://storybook.js.org", "Storybook: frontend workshop", "Build and test UI components in isolation.", 120),
        ("https://atomicdesign.bradfrost.com", "Atomic Design", "Brad Frost's methodology for design systems.", 75),
        ("https://www.radix-ui.com", "Radix UI Primitives", "Unstyled, accessible React components.", 30),
        ("https://ui.shadcn.com", "shadcn/ui", "Copy-paste components built on Radix and Tailwind.", 3),
        ("https://m3.material.io", "Material Design 3", "Google's design system and guidelines.", 150),
        ("https://tailwindcss.com", "Tailwind CSS", "Utility-first CSS framework.", 180),
    ]),
    ("Frontend", [
        ("https://react.dev", "React", "The library for web and native user interfaces.", 200),
        ("https://nextjs.org", "Next.js by Vercel", "The React framework for production.", 110),
        ("https://www.typescriptlang.org", "TypeScript", None, 160),
        ("https://vitejs.dev", "Vite", "Next generation frontend tooling.", 50),
        ("https://developer.mozilla.org", "MDN Web Docs", "Reference and guides for web technologies.", 15),
        ("https://web.dev", "web.dev", "Guidance for building fast, accessible sites.", 88),
    ]),
    ("Backend e Infra", [
        ("https://fastapi.tiangolo.com", "FastAPI", "High performance Python web framework.", 140),
        ("https://www.sqlalchemy.org", "SQLAlchemy", "Python SQL toolkit and ORM.", 100),
        ("https://nginx.org", "nginx", "High performance HTTP server and reverse proxy.", 65),
        ("https://aws.amazon.com/lightsail/", "Amazon Lightsail", "Simple virtual servers on AWS.", 25),
        ("https://www.digitalocean.com/community/tutorials", "DigitalOcean Community Tutorials", "Step-by-step guides for servers and apps.", 12),
        ("https://cheatsheetseries.owasp.org", "OWASP Cheat Sheet Series", "Concise security guidance for developers.", 35),
    ]),
    ("Freelance", [
        ("https://www.workana.com", "Workana", "Projetos freelance para profissionais brasileiros.", 9),
        ("https://www.99freelas.com.br", "99Freelas", "Projetos freelance em português.", 45),
        ("https://www.upwork.com", "Upwork", "Global freelance marketplace.", 80),
        ("https://dribbble.com/jobs", "Dribbble Jobs", "Vagas e clientes para designers.", 6),
        ("https://www.docusign.com", "DocuSign", "Assinatura eletrônica de contratos.", 110),
        ("https://www.bonsaihq.com", "Bonsai", None, 20),
    ]),
    ("Inspiração e Pintura", [
        ("https://www.behance.net", "Behance", "Portfólios criativos da Adobe.", 160),
        ("https://artsandculture.google.com", "Google Arts & Culture", "Acervos de museus do mundo todo.", 70),
        ("https://www.wikiart.org", "WikiArt", "Enciclopédia de arte visual.", 125),
        ("https://www.bobross.com", "Bob Ross", "Tutoriais de pintura a óleo.", 33),
        ("https://www.handprint.com", "Handprint", "Tutoriais de aquarela e pintura.", 18),
        ("https://www.pinterest.com", "Pinterest", None, 240),
    ]),
    ("Leitura e Ferramentas", [
        ("https://news.ycombinator.com", "Hacker News", "Notícias de tecnologia e discussões.", 4),
        ("https://www.smashingmagazine.com", "Smashing Magazine", "Artigos sobre design e desenvolvimento web.", 58),
        ("https://excalidraw.com", "Excalidraw", "Quadro branco colaborativo em estilo desenhado à mão.", 22),
        ("https://coolors.co", "Coolors", "Gerador de paletas de cores.", 140),
        ("https://fonts.google.com", "Google Fonts", "Fontes gratuitas para a web.", 7),
    ]),
    ("Pintura: materiais", [
        ("https://www.winsornewton.com", "Winsor & Newton", "Tintas e materiais de pintura.", 1),
        ("https://www.golden.com", "Golden Artist Colors", None, 52),
    ]),
]

# Bookmarks without a collection (show up only in Recents and All).
UNASSIGNED: list[tuple[str, str, str | None, int]] = [
    ("https://github.com", "GitHub", "Hospedagem e colaboração de código.", 30),
    ("https://en.wikipedia.org", "Wikipedia", None, 240),
]


def assert_local_only() -> None:
    """Refuse to run anywhere that looks like production."""
    for name in ("ENVIRONMENT", "APP_ENV", "ENV"):
        if os.getenv(name, "").strip().lower() in {"prod", "production"}:
            sys.exit(f"Refusing to run: {name} indicates production.")
    if not DATABASE_URL.startswith("sqlite:///"):
        sys.exit(f"Refusing to run: DATABASE_URL is not a local SQLite file ({DATABASE_URL.split('://')[0]}://).")
    for origin in settings.cors_origins:
        host = origin.split("://", 1)[-1].split(":")[0].split("/")[0]
        if host not in LOCAL_HOSTS:
            sys.exit(f"Refusing to run: CORS origin {origin} is not local.")


async def scrape_all(urls: list[str]) -> dict[str, dict | None]:
    """Scrape with the app's own function; None when the page can't be read."""
    sem = asyncio.Semaphore(6)

    async def one(url: str) -> dict | None:
        async with sem:
            try:
                meta = await asyncio.wait_for(fetch_metadata(url), timeout=15)
            except Exception:
                return None
            # fetch_metadata returns domain-only data when the page can't be read.
            if meta.get("title") == domain_from_url(url) and not meta.get("thumbnail"):
                return None
            return meta

    results = await asyncio.gather(*(one(u) for u in urls))
    return dict(zip(urls, results))


def main() -> None:
    assert_local_only()

    entries = [(name, url, title, desc, days) for name, items in COLLECTIONS for url, title, desc, days in items]
    entries += [(None, url, title, desc, days) for url, title, desc, days in UNASSIGNED]
    urls = [url for _, url, *_ in entries]

    print(f"Scraping {len(urls)} URLs (this can take a minute)...")
    scraped = asyncio.run(scrape_all(urls))

    password = secrets.token_urlsafe(18)  # 24 characters, printed at the end only
    UserCreate(email=EMAIL, password=password, name=NAME)  # validates against the app schema

    now = datetime.utcnow()
    rng = random.Random(42)
    stats = {"real_image": 0, "no_image": 0, "fallback": 0}

    with SessionLocal() as db:
        old = db.query(User).filter(func.lower(User.email) == EMAIL).first()
        if old:
            db.query(Bookmark).filter(Bookmark.user_id == old.id).delete()
            db.query(Collection).filter(Collection.user_id == old.id).delete()
            db.delete(old)
            db.flush()

        user = User(email=EMAIL, hashed_password=hash_password(password), name=NAME, created_at=now - timedelta(days=200))
        db.add(user)
        db.flush()

        collection_ids: dict[str, int] = {}
        for name, _ in COLLECTIONS:
            col = Collection(name=name, user_id=user.id, created_at=now - timedelta(days=rng.randint(60, 190)))
            db.add(col)
            db.flush()
            collection_ids[name] = col.id

        for name, url, fb_title, fb_desc, days in entries:
            meta = scraped.get(url)
            domain = domain_from_url(url)
            if meta:
                title, desc = meta.get("title"), meta.get("description")
                thumb = meta.get("thumbnail")
                if thumb:
                    stats["real_image"] += 1
                else:
                    stats["no_image"] += 1
            else:
                title, desc, thumb = fb_title, fb_desc, None
                stats["fallback"] += 1
            created = now - timedelta(days=days, hours=rng.randint(0, 20))
            db.add(Bookmark(
                url=url,
                title=(title or fb_title)[:512],
                description=(desc or None) and desc[:1024],
                thumbnail=thumb,
                favicon=favicon_for_domain(domain),
                domain=domain,
                user_id=user.id,
                collection_id=collection_ids.get(name) if name else None,
                created_at=created,
            ))
        db.commit()

        n_cols = db.query(Collection).filter(Collection.user_id == user.id).count()
        n_bms = db.query(Bookmark).filter(Bookmark.user_id == user.id).count()
        n_users = db.query(User).filter(func.lower(User.email) == EMAIL).count()

    # Check that the real login route accepts the generated password.
    from fastapi.testclient import TestClient
    from app.main import app

    response = TestClient(app).post(
        "/users/login",
        data={"username": EMAIL, "password": password},
        headers={"X-Requested-With": "markit"},
    )
    if response.status_code != 200 or response.json().get("email") != EMAIL:
        sys.exit(f"Login check failed: HTTP {response.status_code}")

    print(f"Database: {DATABASE_URL}")
    print(f"Demo users: {n_users} | Collections: {n_cols} | Bookmarks: {n_bms}")
    print(f"Images: real={stats['real_image']} no-og-image={stats['no_image']} fallback={stats['fallback']}")
    print("Login check: OK")
    print()
    print(f"E-mail: {EMAIL}")
    print(f"Senha: {password}")


if __name__ == "__main__":
    main()
