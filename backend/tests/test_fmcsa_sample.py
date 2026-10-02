from datetime import datetime, timedelta

import pytest

from apps.trips.services.locations import LocationResolver
from apps.trips.services.logbook import build_daily_logs
from apps.trips.types import Activity, DutySegment, DutyStatus, LogDetails, Place
from tests.helpers import straight_path

SAMPLE_DAY = datetime(2021, 4, 9)
SAMPLE_MILES = 350.0

SAMPLE_DETAILS = LogDetails(
    driver_name="John E. Doe",
    carrier_name="John Doe's Transportation",
    main_office_address="Washington, D.C.",
    vehicle_numbers="123, 20544",
    shipping_document="101601",
)

CITIES = {
    0: "Richmond, VA",
    75: "Fredericksburg, VA",
    150: "Baltimore, MD",
    255: "Philadelphia, PA",
    300: "Cherry Hill, NJ",
    350: "Newark, NJ",
}

SAMPLE_SCHEDULE = [
    (DutyStatus.OFF_DUTY, Activity.BEFORE_TRIP, "00:00", "06:00", 0, 0),
    (DutyStatus.ON_DUTY, Activity.PICKUP, "06:00", "07:30", 0, 0),
    (DutyStatus.DRIVING, Activity.DRIVE_TO_DROPOFF, "07:30", "09:00", 0, 75),
    (DutyStatus.ON_DUTY, Activity.FUEL, "09:00", "09:30", 75, 75),
    (DutyStatus.DRIVING, Activity.DRIVE_TO_DROPOFF, "09:30", "12:00", 75, 150),
    (DutyStatus.OFF_DUTY, Activity.BREAK, "12:00", "13:00", 150, 150),
    (DutyStatus.DRIVING, Activity.DRIVE_TO_DROPOFF, "13:00", "15:00", 150, 255),
    (DutyStatus.ON_DUTY, Activity.DROPOFF, "15:00", "15:30", 255, 255),
    (DutyStatus.DRIVING, Activity.DRIVE_TO_DROPOFF, "15:30", "16:00", 255, 300),
    (DutyStatus.SLEEPER, Activity.REST, "16:00", "17:45", 300, 300),
    (DutyStatus.DRIVING, Activity.DRIVE_TO_DROPOFF, "17:45", "19:00", 300, 350),
    (DutyStatus.ON_DUTY, Activity.DROPOFF, "19:00", "21:00", 350, 350),
    (DutyStatus.OFF_DUTY, Activity.AFTER_TRIP, "21:00", "24:00", 350, 350),
]


def clock(text: str) -> datetime:
    hours, minutes = (int(part) for part in text.split(":"))
    return SAMPLE_DAY + timedelta(hours=hours, minutes=minutes)


def build_sample_segments() -> list[DutySegment]:
    return [
        DutySegment(status, activity, clock(start), clock(end), from_mile, to_mile, 0, 0)
        for status, activity, start, end, from_mile, to_mile in SAMPLE_SCHEDULE
    ]


def build_sample_log():
    waypoints = [(float(mile), Place(label, 37.0, -100.0)) for mile, label in CITIES.items()]
    resolver = LocationResolver(straight_path(SAMPLE_MILES), waypoints)
    segments = build_sample_segments()[1:-1]
    return build_daily_logs(segments, resolver, SAMPLE_DETAILS)[0]


def test_sample_totals_match_the_fmcsa_completed_log():
    totals = build_sample_log().totals
    assert totals == {"off_duty": 10.0, "sleeper": 1.75, "driving": 7.75, "on_duty": 4.5}
    assert sum(totals.values()) == pytest.approx(24.0)


def test_sample_total_miles_match_the_fmcsa_completed_log():
    assert build_sample_log().total_miles == pytest.approx(SAMPLE_MILES)


def test_sample_recap_on_duty_hours_are_driving_plus_on_duty():
    assert build_sample_log().recap.on_duty_today == pytest.approx(12.25)


def test_sample_remarks_record_every_city_where_the_duty_status_changed():
    log = build_sample_log()
    cities = [remark.location for remark in log.remarks]
    for expected in ("Richmond, VA", "Fredericksburg, VA", "Baltimore, MD", "Philadelphia, PA"):
        assert expected in cities
    assert cities[-1] == "Newark, NJ"


def test_sample_header_fields_are_carried_to_the_sheet():
    log = build_sample_log()
    assert log.date == "2021-04-09"
    assert log.from_location == "Richmond, VA"
    assert log.to_location == "Newark, NJ"
    assert log.details.shipping_document == "101601"
    assert log.details.vehicle_numbers == "123, 20544"
