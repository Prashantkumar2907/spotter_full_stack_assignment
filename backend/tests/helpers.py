from array import array
from datetime import datetime

from apps.trips.services.hos_rules import DEFAULT_RULES, HosRules
from apps.trips.services.locations import LocationResolver
from apps.trips.services.route_path import RoutePath
from apps.trips.types import Activity, DutySegment, DutyStatus, Place

WORKING_STATUSES = (DutyStatus.DRIVING, DutyStatus.ON_DUTY)
MILE_TOLERANCE = 1.0


def encode_polyline(points: list[tuple[float, float]], precision: int = 6) -> str:
    factor = 10**precision
    output, previous_lat, previous_lng = [], 0, 0
    for lat, lng in points:
        scaled_lat, scaled_lng = round(lat * factor), round(lng * factor)
        output.append(_encode_value(scaled_lat - previous_lat))
        output.append(_encode_value(scaled_lng - previous_lng))
        previous_lat, previous_lng = scaled_lat, scaled_lng
    return "".join(output)


def _encode_value(value: int) -> str:
    value = ~(value << 1) if value < 0 else value << 1
    chunks = []
    while value >= 0x20:
        chunks.append(chr((0x20 | (value & 0x1F)) + 63))
        value >>= 5
    chunks.append(chr(value + 63))
    return "".join(chunks)


def straight_path(total_miles: float) -> RoutePath:
    lats = array("d", [37.0, 38.0, 39.0, 40.0])
    lngs = array("d", [-100.0, -99.0, -98.0, -97.0])
    return RoutePath(lats, lngs, total_miles)


def mile_resolver(total_miles: float, waypoints=()) -> LocationResolver:
    return LocationResolver(
        straight_path(total_miles),
        waypoints,
        describe=lambda lat, lng: f"Spot {lat:.1f},{lng:.1f}",
    )


def place(label: str = "Origin", lat: float = 37.0, lng: float = -100.0) -> Place:
    return Place(label, lat, lng)


class ComplianceChecker:
    def __init__(self, segments: list[DutySegment], rules: HosRules) -> None:
        self.rules = rules
        self.shift_start = segments[0].start
        self.cycle = segments[0].cycle_before
        self.shift_driving = self.since_break = self.pause = self.off_run = 0
        self.miles_since_fuel = 0.0

    def check(self, previous: DutySegment | None, segment: DutySegment) -> None:
        if previous is not None:
            assert previous.end == segment.start
        self._track_rest(segment)
        if segment.status in WORKING_STATUSES:
            self.cycle += segment.minutes
            assert self.cycle <= self.rules.cycle_limit
        if segment.status == DutyStatus.DRIVING:
            self._check_driving(segment)
        if segment.activity == Activity.FUEL:
            self.miles_since_fuel = 0.0

    def _track_rest(self, segment: DutySegment) -> None:
        if segment.status in WORKING_STATUSES:
            self._resume_work(segment)
        else:
            self.off_run += segment.minutes
        driving = segment.status == DutyStatus.DRIVING
        self.pause = 0 if driving else self.pause + segment.minutes
        if self.pause >= self.rules.break_length:
            self.since_break = 0

    def _resume_work(self, segment: DutySegment) -> None:
        if self.off_run >= self.rules.daily_rest:
            self.shift_start, self.shift_driving = segment.start, 0
        if self.off_run >= self.rules.restart_length:
            self.cycle = 0
        self.off_run = 0

    def _check_driving(self, segment: DutySegment) -> None:
        rules = self.rules
        self.shift_driving += segment.minutes
        self.since_break += segment.minutes
        self.miles_since_fuel += segment.miles
        assert self.shift_driving <= rules.max_driving
        assert self.since_break <= rules.break_after_driving
        assert (segment.end - self.shift_start).total_seconds() / 60 <= rules.driving_window
        assert self.miles_since_fuel <= rules.fuel_interval_miles + MILE_TOLERANCE


def assert_compliant(segments: list[DutySegment], rules: HosRules = DEFAULT_RULES) -> None:
    checker = ComplianceChecker(segments, rules)
    for previous, segment in zip([None, *segments], segments, strict=False):
        checker.check(previous, segment)


def at(day: int, hour: int, minute: int = 0) -> datetime:
    return datetime(2026, 10, day, hour, minute)
