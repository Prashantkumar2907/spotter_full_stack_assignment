from rest_framework import status
from rest_framework.exceptions import Throttled, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

from apps.trips.exceptions import TripPlanningError

VALIDATION_MESSAGE = "Some trip details need attention."
THROTTLE_MESSAGE = "Too many requests. Please wait a moment and try again."


def error_response(code: str, message: str, http_status: int, fields: dict | None = None):
    body = {"error": {"code": code, "message": message}}
    if fields:
        body["error"]["fields"] = fields
    return Response(body, status=http_status)


def handle_exception(exc, context):
    if isinstance(exc, TripPlanningError):
        return error_response(exc.code, exc.message, exc.status_code)
    if isinstance(exc, ValidationError):
        fields = exc.detail if isinstance(exc.detail, dict) else {"non_field_errors": exc.detail}
        return error_response(
            "validation_error", VALIDATION_MESSAGE, status.HTTP_400_BAD_REQUEST, fields
        )
    if isinstance(exc, Throttled):
        return error_response("rate_limited", THROTTLE_MESSAGE, status.HTTP_429_TOO_MANY_REQUESTS)
    return exception_handler(exc, context)
