from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum


class DutyStatus(StrEnum):
    OFF_DUTY = "off_duty"
    SLEEPER = "sleeper"
    DRIVING = "driving"
    ON_DUTY = "on_duty"


class Activity(StrEnum):
    BEFORE_TRIP = "before_trip"
    AFTER_TRIP = "after_trip"
    DRIVE_TO_PICKUP = "drive_to_pickup"
    DRIVE_TO_DROPOFF = "drive_to_dropoff"
    PICKUP = "pickup"
    DROPOFF = "dropoff"
    FUEL = "fuel"
    BREAK = "break"
    REST = "rest"
    RESTART = "restart"


class StopKind(StrEnum):
    START = "start"
    PICKUP = "pickup"
    DROPOFF = "dropoff"
    FUEL = "fuel"
    BREAK = "break"
    REST = "rest"
    RESTART = "restart"


@dataclass(frozen=True, slots=True)
class Place:
    label: str
    lat: float
    lng: float


type LocationInput = Place | str


@dataclass(frozen=True, slots=True)
class Route:
    polyline: str
    leg_miles: tuple[float, ...]

    @property
    def total_miles(self) -> float:
        return sum(self.leg_miles)


@dataclass(frozen=True, slots=True)
class DutySegment:
    status: DutyStatus
    activity: Activity
    start: datetime
    end: datetime
    start_mile: float
    end_mile: float
    cycle_before: int
    cycle_after: int

    @property
    def minutes(self) -> int:
        return round((self.end - self.start).total_seconds() / 60)

    @property
    def miles(self) -> float:
        return self.end_mile - self.start_mile


@dataclass(frozen=True, slots=True)
class LogDetails:
    driver_name: str = ""
    carrier_name: str = ""
    main_office_address: str = ""
    home_terminal_address: str = ""
    vehicle_numbers: str = ""
    shipping_document: str = ""
    commodity: str = ""


@dataclass(frozen=True, slots=True)
class TripRequest:
    current: LocationInput
    pickup: LocationInput
    dropoff: LocationInput
    cycle_used_hours: float
    start_time: datetime
    log_details: LogDetails = field(default_factory=LogDetails)


@dataclass(frozen=True, slots=True)
class LogSegmentView:
    status: str
    activity: str
    start_minute: int
    end_minute: int


@dataclass(frozen=True, slots=True)
class RemarkView:
    minute: int
    location: str
    note: str


@dataclass(frozen=True, slots=True)
class RecapView:
    on_duty_today: float
    cycle_total: float
    available_tomorrow: float
    last_five_days: float
    restart_taken: bool


@dataclass(frozen=True, slots=True)
class DailyLog:
    date: str
    day_number: int
    from_location: str
    to_location: str
    total_miles: float
    totals: dict[str, float]
    segments: list[LogSegmentView]
    remarks: list[RemarkView]
    recap: RecapView
    details: LogDetails


@dataclass(frozen=True, slots=True)
class StopView:
    id: int
    kind: str
    title: str
    location: str
    lat: float
    lng: float
    mile: float
    arrive: str
    depart: str
    duration_minutes: int
    day_number: int


@dataclass(frozen=True, slots=True)
class WaypointView:
    role: str
    label: str
    lat: float
    lng: float


@dataclass(frozen=True, slots=True)
class LegView:
    from_label: str
    to_label: str
    miles: float
    drive_minutes: int


@dataclass(frozen=True, slots=True)
class RouteView:
    polyline: str
    precision: int
    waypoints: list[WaypointView]
    legs: list[LegView]


@dataclass(frozen=True, slots=True)
class SummaryView:
    total_miles: float
    driving_minutes: int
    on_duty_minutes: int
    total_minutes: int
    start: str
    end: str
    days: int
    fuel_stops: int
    breaks: int
    rests: int
    restarts: int


@dataclass(frozen=True, slots=True)
class TripPlan:
    summary: SummaryView
    route: RouteView
    stops: list[StopView]
    logs: list[DailyLog]
