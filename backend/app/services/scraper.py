import asyncio
import ipaddress
import socket
from urllib.parse import ParseResult, urljoin, urlparse

import httpx
from app.services.url import domain_from_url, favicon_for_domain, validate_http_url
from bs4 import BeautifulSoup

MAX_BYTES = 1_000_000  # read at most ~1 MB of HTML
MAX_REDIRECTS = 3
USER_AGENT = "MarkitBot/1.0 (+bookmark metadata fetcher)"

# Networks never fetched, on top of ipaddress' is_global check.
BLOCKED_NETWORKS = [
    ipaddress.ip_network("100.64.0.0/10"),  # carrier-grade NAT
    ipaddress.ip_network("192.0.0.0/24"),  # IETF protocol assignments
]


class UnsafeURLError(ValueError):
    """The URL points somewhere the server must not fetch (SSRF guard)."""


def _as_ip(address: str) -> ipaddress.IPv4Address | ipaddress.IPv6Address:
    ip = ipaddress.ip_address(address)
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
        return ip.ipv4_mapped
    return ip


async def _resolve_public_ip(hostname: str) -> str:
    """Resolve the host once, reject if any address is not public, return one of them.

    The caller connects to the returned IP, so the address that was checked is
    the address that is used (no second DNS lookup that could return something else).
    """
    loop = asyncio.get_running_loop()  # non-blocking lookup, does not stall the event loop
    try:
        infos = await loop.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
    except socket.gaierror:
        raise UnsafeURLError("This address could not be resolved")
    if not infos:
        raise UnsafeURLError("This address could not be resolved")

    addresses = []
    for info in infos:
        ip = _as_ip(info[4][0])
        if not ip.is_global or any(ip in network for network in BLOCKED_NETWORKS):
            raise UnsafeURLError("This address can't be bookmarked")
        addresses.append(str(ip))
    return addresses[0]


def _pinned_target(parsed: ParseResult, ip: str) -> tuple[str, str]:
    """Build a URL that points at the validated IP, plus the Host header to keep."""
    port = parsed.port
    ip_part = f"[{ip}]" if ":" in ip else ip
    target = f"{parsed.scheme}://{ip_part}{f':{port}' if port else ''}{parsed.path or '/'}"
    if parsed.query:
        target += f"?{parsed.query}"
    host_header = parsed.hostname if port is None else f"{parsed.hostname}:{port}"
    return target, host_header


async def _fetch_html(url: str) -> str:
    current = url
    timeout = httpx.Timeout(8.0)  # per network operation; the router adds a total deadline
    # Redirects are followed manually so every hop is resolved and checked again.
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
        for _ in range(MAX_REDIRECTS + 1):
            parsed = urlparse(current)
            hostname = parsed.hostname or ""
            ip = await _resolve_public_ip(hostname)
            target, host_header = _pinned_target(parsed, ip)
            # Host keeps virtual hosting working; sni_hostname keeps TLS certificate checks on the real name.
            extensions = {"sni_hostname": hostname} if parsed.scheme == "https" else {}
            headers = {"User-Agent": USER_AGENT, "Host": host_header}

            async with client.stream("GET", target, headers=headers, extensions=extensions) as response:
                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location:
                        return ""
                    current = validate_http_url(urljoin(current, location))
                    continue
                if "html" not in response.headers.get("content-type", "").lower():
                    return ""
                buffer = bytearray()
                async for chunk in response.aiter_bytes():
                    buffer.extend(chunk)
                    if len(buffer) >= MAX_BYTES:
                        break
                encoding = response.encoding or "utf-8"
                try:
                    return bytes(buffer[:MAX_BYTES]).decode(encoding, errors="replace")
                except LookupError:
                    return bytes(buffer[:MAX_BYTES]).decode("utf-8", errors="replace")
    raise UnsafeURLError("Too many redirects")


def _safe_image(page_url: str, value: str | None) -> str | None:
    """Resolve a (possibly relative) image URL against the page; keep only http(s)."""
    if not value:
        return None
    try:
        return validate_http_url(urljoin(page_url, value.strip()))
    except ValueError:
        return None


def fallback_metadata(url: str) -> dict:
    """Domain-only metadata, used when the page can't be read in time."""
    domain = domain_from_url(url)
    return {
        "title": domain,
        "description": None,
        "thumbnail": None,
        "favicon": favicon_for_domain(domain),
        "domain": domain,
    }


async def fetch_metadata(url: str) -> dict:
    """Return title/description/thumbnail for `url`.

    Raises UnsafeURLError for private or otherwise disallowed targets.
    Network or parsing failures fall back to domain-only metadata.
    """
    domain = domain_from_url(url)
    try:
        html = await _fetch_html(url)
    except UnsafeURLError:
        raise
    except Exception:
        return fallback_metadata(url)

    try:
        soup = BeautifulSoup(html, "html.parser")

        def og(prop):
            tag = soup.find("meta", property=f"og:{prop}")
            return tag.get("content") if tag else None

        title_tag = soup.title.string if soup.title and soup.title.string else None
        return {
            "title": og("title") or title_tag or domain,
            "description": og("description"),
            "thumbnail": _safe_image(url, og("image")),
            "favicon": favicon_for_domain(domain),
            "domain": domain,
        }
    except Exception:
        return fallback_metadata(url)
