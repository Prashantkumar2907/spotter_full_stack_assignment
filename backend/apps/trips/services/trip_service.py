from collections.abc import Sequence
from concurrent.futures import ThreadPoolExecutor
from itertools import pairwise

from apps.trips.constants import MILES_DECIMALS, POLYLINE_PRECISION
from apps.trips.services.geocoding import GeocodingService
from apps.trips.services.hos_planner import plan_duty_segments
from apps.trips.services.hos_rules import DEFAULT_RULES, HosRules
from apps.trips.services.locations import LocationResolver
from apps.trips.services.logbook import build_daily_logs
from apps.trips.services.route_path import path_for
from apps.trips.services.routing import RoutingService
from apps.trips.services.stops import build_stops
from apps.trips.services.summary import build_summary
from apps.trips.types import (
    LegView,
    Place,
    Route,
    RouteView,
    TripPlan,
    TripRequest,
    WaypointView,
)

WAYPOINT_ROLES = ("current", "pickup", "dropoff")


class TripPlanningService:
    def __init__(
        self,
        geocoder: GeocodingService,
        router: RoutingService,
        rules: HosRules = DEFAULT_RULES,
    ) -> None:
        self._geocoder = geocoder
        self._router = router
        self._rules = rules

    def plan(self, request: TripRequest) -> TripPlan:
        waypoints = self._resolve_waypoints(request)
        route = self._router.route(waypoints)
        start = request.start_time.replace(second=0, microsecond=0)
        segments = plan_duty_segments(route.leg_miles, start, request.cycle_used_hours, self._rules)
        resolver = LocationResolver(path_for(route), self._waypoint_miles(route, waypoints))
        logs = build_daily_logs(segments, resolver, request.log_details)
        return TripPlan(
            summary=build_summary(segments, route.total_miles, len(logs)),
            route=self._route_view(route, waypoints),
            stops=build_stops(segments, resolver, waypoints[0]),
            logs=logs,
        )

    def _resolve_waypoints(self, request: TripRequest) -> list[Place]:
        inputs = [request.current, request.pickup, request.dropoff]
        pending = [item for item in inputs if isinstance(item, str)]
        if not pending:
            return inputs
        with ThreadPoolExecutor(max_workers=len(pending)) as pool:
            resolved = iter(pool.map(self._geocoder.resolve, pending))
        return [next(resolved) if isinstance(item, str) else item for item in inputs]

    @staticmethod
    def _waypoint_miles(route: Route, waypoints: Sequence[Place]) -> list[tuple[float, Place]]:
        miles, travelled = [0.0], 0.0
        for leg in route.leg_miles:
            travelled += leg
            miles.append(travelled)
        return list(zip(miles, waypoints, strict=True))

    def _route_view(self, route: Route, waypoints: Sequence[Place]) -> RouteView:
        legs = [
            LegView(
                from_label=start.label,
                to_label=end.label,
                miles=round(miles, MILES_DECIMALS),
                drive_minutes=round(miles / self._rules.miles_per_minute),
            )
            for (start, end), miles in zip(pairwise(waypoints), route.leg_miles, strict=True)
        ]
        views = [
            WaypointView(role, place.label, place.lat, place.lng)
            for role, place in zip(WAYPOINT_ROLES, waypoints, strict=True)
        ]
        return RouteView(
            polyline=route.polyline,
            precision=POLYLINE_PRECISION,
            waypoints=views,
            legs=legs,
        )
