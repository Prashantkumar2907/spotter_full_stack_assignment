import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DEFAULT_DEV_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-secret-key" if DEBUG else "")
if not SECRET_KEY:
    raise RuntimeError("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is not 1")

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

INSTALLED_APPS = [
    "corsheaders",
    "rest_framework",
    "apps.trips",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "milemark-default",
        "OPTIONS": {"MAX_ENTRIES": 2000},
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_TZ = False

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", DEFAULT_DEV_ORIGINS)
CORS_ALLOW_METHODS = ["GET", "POST", "OPTIONS"]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
    "UNAUTHENTICATED_USER": None,
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "EXCEPTION_HANDLER": "apps.trips.api.exception_handler.handle_exception",
    "DEFAULT_THROTTLE_RATES": {
        "plan": os.environ.get("PLAN_RATE_LIMIT", "30/min"),
        "search": os.environ.get("SEARCH_RATE_LIMIT", "120/min"),
    },
    "NUM_PROXIES": int(os.environ.get("NUM_PROXIES", "0")),
}
