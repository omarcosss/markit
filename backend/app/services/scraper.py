from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup


async def fetch_metadata(url: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, follow_redirects=True)
            soup = BeautifulSoup(response.text, "html.parser")

        def og(prop):
            tag = soup.find("meta", property=f"og:{prop}")
            return tag["content"] if tag else None

        domain = urlparse(url).netloc.replace("www.", "")

        return {
            "title": og("title") or soup.title.string or domain,
            "description": og("description"),
            "thumbnail": og("image"),
            "favicon": f"https://www.google.com/s2/favicons?domain={domain}&sz=64",
            "domain": domain,
        }
    except Exception:
        domain = urlparse(url).netloc.replace("www.", "")
        return {
            "title": domain,
            "description": None,
            "thumbnail": None,
            "favicon": f"https://www.google.com/s2/favicons?domain={domain}&sz=64",
            "domain": domain,
        }
