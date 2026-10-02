from datetime import datetime

from apps.trips.constants import MILES_DECIMALS
from apps.trips.services.labels import STOP_KIND_BY_ACTIVITY, STOP_TITLES
from apps.trips.services.locations import LocationResolver
from apps.trips.types import DutySegment, Place, StopKind, StopView
from apps.trips.utils.timeutils import start_of_day


def day_number(segment_start: datetime, first_start: datetime) -> int:
    return (start_of_day(segment_start) - start_of_day(first_start)).days + 1


def start_stop(first: DutySegment, origin: Place) -> StopView:
    return StopView(
        id=0,
        kind=StopKind.START.value,
        title=STOP_TITLES[StopKind.START],
        location=origin.label,
        lat=origin.lat,
        lng=origin.lng,
        mile=0.0,
        arrive=first.start.isoformat(),
        depart=first.start.isoformat(),
        duration_minutes=0,
        day_number=1,
    )


def stop_from_segment(
    stop_id: int, segment: DutySegment, first: DutySegment, resolver: LocationResolver
) -> StopView:
    kind = STOP_KIND_BY_ACTIVITY[segment.activity]
    place = resolver.place_at(segment.start_mile)
    return StopView(
        id=stop_id,
        kind=kind.value,
        title=STOP_TITLES[kind],
        location=place.label,
        lat=place.lat,
        lng=place.lng,
        mile=round(segment.start_mile, MILES_DECIMALS),
        arrive=segment.start.isoformat(),
        depart=segment.end.isoformat(),
        duration_minutes=segment.minutes,
        day_number=day_number(segment.start, first.start),
    )


def build_stops(
    segments: list[DutySegment], resolver: LocationResolver, origin: Place
) -> list[StopView]:
    first = segments[0]
    stops = [start_stop(first, origin)]
    for segment in segments:
        if segment.activity in STOP_KIND_BY_ACTIVITY:
            stops.append(stop_from_segment(len(stops), segment, first, resolver))
    return stops
