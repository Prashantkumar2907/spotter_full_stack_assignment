import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from apps.trips.constants import (
    HTTP_BACKOFF_SECONDS,
    HTTP_POOL_SIZE,
    HTTP_RETRIES,
    HTTP_TIMEOUT_SECONDS,
    USER_AGENT,
)
from apps.trips.exceptions import UpstreamServiceError

RETRY_STATUSES = (502, 503, 504)
SERVER_ERROR_FLOOR = 500


def build_session() -> requests.Session:
    retry = Retry(
        total=HTTP_RETRIES,
        backoff_factor=HTTP_BACKOFF_SECONDS,
        status_forcelist=RETRY_STATUSES,
        allowed_methods=("GET",),
        raise_on_status=False,
    )
    adapter = HTTPAdapter(
        max_retries=retry, pool_connections=HTTP_POOL_SIZE, pool_maxsize=HTTP_POOL_SIZE
    )
    session = requests.Session()
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers["User-Agent"] = USER_AGENT
    return session


class JsonHttpClient:
    def __init__(self, service_name: str, session: requests.Session | None = None) -> None:
        self._service_name = service_name
        self._session = session or build_session()

    def get_json(self, url: str, params: dict | None = None) -> dict:
        try:
            response = self._session.get(url, params=params, timeout=HTTP_TIMEOUT_SECONDS)
        except requests.RequestException as error:
            raise UpstreamServiceError(
                f"{self._service_name} is not reachable right now"
            ) from error
        if response.status_code >= SERVER_ERROR_FLOOR:
            raise UpstreamServiceError(f"{self._service_name} returned an error")
        try:
            return response.json()
        except ValueError as error:
            raise UpstreamServiceError(f"{self._service_name} sent an unreadable reply") from error
