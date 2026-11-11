import re
from urllib.parse import urlparse

_SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*://")
_HOST_RE = re.compile(r"^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$")
MAX_URL_LENGTH = 2048
ALLOWED_PORTS = {80, 443}


def normalize_url(url: str) -> str:
    """Return the URL with an explicit scheme, defaulting to https://.

    Lets users type "dribbble.com" and still get a working link.
    """
    url = url.strip()
    if _SCHEME_RE.match(url):
        return url
    if url.startswith("//"):
        return f"https:{url}"
    return f"https://{url}"


def validate_http_url(url: str) -> str:
    """Accept only absolute http(s) URLs with a valid host. Raises ValueError."""
    if not url or len(url) > MAX_URL_LENGTH:
        raise ValueError("URL is empty or too long")
    try:
        parsed = urlparse(url)
        parsed.port  # raises ValueError for invalid ports
    except ValueError:
        raise ValueError("Invalid URL")
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only http:// and https:// links are allowed")
    if parsed.port is not None and parsed.port not in ALLOWED_PORTS:
        raise ValueError("Only ports 80 and 443 are allowed")
    host = parsed.hostname
    if not host or not _HOST_RE.match(host):
        raise ValueError("Invalid URL host")
    return url


def clean_url(url: str) -> str:
    """Normalize then validate a user-supplied link."""
    return validate_http_url(normalize_url(url))


def domain_from_url(url: str) -> str:
    return urlparse(url).netloc.replace("www.", "")


def favicon_for_domain(domain: str) -> str:
    return f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
