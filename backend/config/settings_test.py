import os

os.environ.setdefault("DJANGO_SECRET_KEY", "test-secret-key")

from config.settings import *

REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_THROTTLE_RATES": {"plan": "1000/min", "search": "1000/min"},
}
