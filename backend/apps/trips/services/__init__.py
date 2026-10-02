from functools import lru_cache

from apps.trips.services.geocoding import GeocodingService
from apps.trips.services.routing import RoutingService
from apps.trips.services.trip_service import TripPlanningService


@lru_cache(maxsize=1)
def get_geocoding_service() -> GeocodingService:
    return GeocodingService()


@lru_cache(maxsize=1)
def get_routing_service() -> RoutingService:
    return RoutingService()


@lru_cache(maxsize=1)
def get_trip_service() -> TripPlanningService:
    return TripPlanningService(get_geocoding_service(), get_routing_service())
