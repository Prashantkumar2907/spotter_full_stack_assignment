from collections.abc import Sequence

from django.core.cache import cache

from apps.trips.constants import (
    METERS_PER_MILE,
    POLYLINE_PRECISION,
    ROUTE_CACHE_SECONDS,
)
from apps.trips.exceptions import RouteNotFound, UpstreamServiceError
from apps.trips.types import Place, Route
from apps.trips.utils.cache import cache_key
from apps.trips.utils.http import JsonHttpClient

OSRM_URL = "https://router.project-osrm.org"
UNROUTABLE_CODES = frozenset({"NoRoute", "NoSegment"})
MIN_WAYPOINTS = 2


def coordinate_path(waypoints: Sequence[Place]) -> str:
    return ";".join(f"{place.lng:.6f},{place.lat:.6f}" for place in waypoints)


def parse_route(payload: dict) -> Route:
    code = payload.get("code")
    if code in UNROUTABLE_CODES:
        raise RouteNotFound("No drivable road connects these locations")
    if code != "Ok" or not payload.get("routes"):
        raise UpstreamServiceError("The routing service sent an unexpected reply")
    route = payload["routes"][0]
    leg_miles = tuple(leg["distance"] / METERS_PER_MILE for leg in route["legs"])
    return Route(polyline=route["geometry"], leg_miles=leg_miles)


class RoutingService:
    def __init__(self, http: JsonHttpClient | None = None, base_url: str = OSRM_URL) -> None:
        self._http = http or JsonHttpClient("The routing service")
        self._base_url = base_url

    def route(self, waypoints: Sequence[Place]) -> Route:
        if len(waypoints) < MIN_WAYPOINTS:
            raise ValueError("a route needs at least two waypoints")
        path = coordinate_path(waypoints)
        key = cache_key("route", path)
        cached = cache.get(key)
        if cached is not None:
            return cached
        payload = self._http.get_json(
            f"{self._base_url}/route/v1/driving/{path}",
            params={"overview": "full", "geometries": f"polyline{POLYLINE_PRECISION}"},
        )
        route = parse_route(payload)
        cache.set(key, route, ROUTE_CACHE_SECONDS)
        return route
