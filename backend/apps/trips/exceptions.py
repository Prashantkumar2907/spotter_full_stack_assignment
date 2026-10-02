class TripPlanningError(Exception):
    code = "trip_planning_error"
    status_code = 400

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class LocationNotFound(TripPlanningError):
    code = "location_not_found"
    status_code = 422


class RouteNotFound(TripPlanningError):
    code = "route_not_found"
    status_code = 422


class UpstreamServiceError(TripPlanningError):
    code = "upstream_unavailable"
    status_code = 502


class PlanningInvariantError(RuntimeError):
    pass
