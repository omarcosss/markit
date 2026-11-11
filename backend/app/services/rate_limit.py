import threading
import time
from collections import OrderedDict, deque

from fastapi import HTTPException, status

# Upper bound on tracked keys, so attackers can't grow memory by sending fake e-mails.
MAX_KEYS = 50_000
# Expired keys are swept every N calls instead of on every request.
CLEANUP_EVERY = 256


class RateLimiter:
    """Sliding-window limiter kept in memory.

    Note: the state lives in each process. With several uvicorn workers, each
    worker enforces its own limit, so the effective limit multiplies by the
    number of workers.
    """

    def __init__(self, max_attempts: int, window_seconds: int, message: str):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.message = message
        self._hits: OrderedDict[str, deque[float]] = OrderedDict()
        self._lock = threading.Lock()
        self._calls = 0

    def _sweep(self, now: float) -> None:
        """Drop keys whose attempts have all expired."""
        for key in list(self._hits):
            hits = self._hits[key]
            while hits and now - hits[0] > self.window_seconds:
                hits.popleft()
            if not hits:
                del self._hits[key]

    def hit(self, key: str) -> None:
        """Record an attempt for `key`; raise 429 when the window is full."""
        now = time.monotonic()
        with self._lock:
            self._calls += 1
            if self._calls % CLEANUP_EVERY == 0:
                self._sweep(now)

            hits = self._hits.get(key)
            if hits is None:
                hits = deque()
                self._hits[key] = hits
            else:
                self._hits.move_to_end(key)

            while hits and now - hits[0] > self.window_seconds:
                hits.popleft()
            if len(hits) >= self.max_attempts:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=self.message,
                    headers={"Retry-After": str(self.window_seconds)},
                )
            hits.append(now)

            # Evict least recently used keys once the cap is reached.
            while len(self._hits) > MAX_KEYS:
                self._hits.popitem(last=False)

    def reset(self, key: str) -> None:
        with self._lock:
            self._hits.pop(key, None)


# Login: 10 attempts per account and 50 per IP every 15 minutes.
login_by_email = RateLimiter(10, 15 * 60, "Too many sign-in attempts. Try again in a few minutes.")
login_by_ip = RateLimiter(50, 15 * 60, "Too many sign-in attempts. Try again in a few minutes.")
# Registration: 5 accounts per IP per hour.
register_by_ip = RateLimiter(5, 60 * 60, "Too many accounts created from this network. Try again later.")
