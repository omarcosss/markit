import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()

# Values that must never be used as a signing key.
_PLACEHOLDER_KEYS = {"", "changeme", "change-me-in-production"}
_MIN_SECRET_LENGTH = 32
_MIN_DISTINCT_CHARS = 10  # rejects keys like "a" * 40 that pass the length check


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    secret_key: str
    access_token_expire_minutes: int
    cors_origins: list[str]
    cookie_secure: bool
    enable_docs: bool


def load_settings() -> Settings:
    secret_key = os.getenv("SECRET_KEY", "")
    if (
        secret_key in _PLACEHOLDER_KEYS
        or len(secret_key) < _MIN_SECRET_LENGTH
        or len(set(secret_key)) < _MIN_DISTINCT_CHARS
    ):
        raise RuntimeError(
            "SECRET_KEY must be set to a random value with at least "
            f"{_MIN_SECRET_LENGTH} characters and at least {_MIN_DISTINCT_CHARS} "
            "different characters. Generate one with: "
            "python -c \"import secrets; print(secrets.token_urlsafe(48))\""
        )

    origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]

    return Settings(
        secret_key=secret_key,
        # Shorter-lived sessions than the previous 30 days.
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")),
        cors_origins=origins,
        cookie_secure=_env_bool("COOKIE_SECURE", True),
        enable_docs=_env_bool("ENABLE_DOCS", False),
    )


settings = load_settings()
