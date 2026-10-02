from collections.abc import Callable, Sequence

from apps.trips.services.places import describe_location
from apps.trips.services.route_path import RoutePath
from apps.trips.types import Place

WAYPOINT_TOLERANCE_MILES = 0.05

Describer = Callable[[float, float], str]


class LocationResolver:
    def __init__(
        self,
        path: RoutePath,
        waypoints: Sequence[tuple[float, Place]],
        describe: Describer = describe_location,
    ) -> None:
        self._path = path
        self._waypoints = tuple(waypoints)
        self._describe = describe

    def place_at(self, mile: float) -> Place:
        for waypoint_mile, place in self._waypoints:
            if abs(mile - waypoint_mile) <= WAYPOINT_TOLERANCE_MILES:
                return place
        lat, lng = self._path.point_at(mile)
        return Place(self._describe(lat, lng), lat, lng)
