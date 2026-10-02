from array import array
from bisect import bisect_right
from functools import lru_cache
from itertools import accumulate

from apps.trips.exceptions import RouteNotFound
from apps.trips.types import Route
from apps.trips.utils.geo import interpolate, planar_miles
from apps.trips.utils.polyline import decode_polyline

PATH_CACHE_SIZE = 16


class RoutePath:
    def __init__(self, lats: array, lngs: array, total_miles: float) -> None:
        if not lats:
            raise RouteNotFound("The route has no geometry")
        self._lats, self._lngs = lats, lngs
        raw = [0.0, *accumulate(map(planar_miles, lats, lngs, lats[1:], lngs[1:]))]
        scale = total_miles / raw[-1] if raw[-1] > 0 else 0.0
        self._cumulative = array("d", (value * scale for value in raw))

    def point_at(self, mile: float) -> tuple[float, float]:
        last = len(self._cumulative) - 1
        index = bisect_right(self._cumulative, mile)
        if index <= 0:
            return self._lats[0], self._lngs[0]
        if index > last:
            return self._lats[last], self._lngs[last]
        span = self._cumulative[index] - self._cumulative[index - 1]
        fraction = (mile - self._cumulative[index - 1]) / span if span > 0 else 0.0
        return interpolate(
            (self._lats[index - 1], self._lngs[index - 1]),
            (self._lats[index], self._lngs[index]),
            fraction,
        )


@lru_cache(maxsize=PATH_CACHE_SIZE)
def build_route_path(polyline: str, total_miles: float) -> RoutePath:
    lats, lngs = decode_polyline(polyline)
    return RoutePath(lats, lngs, total_miles)


def path_for(route: Route) -> RoutePath:
    return build_route_path(route.polyline, route.total_miles)
