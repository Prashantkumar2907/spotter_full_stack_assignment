import itertools

import pytest

from apps.trips.services.hos_planner import plan_duty_segments
from apps.trips.services.hos_rules import HosRules
from apps.trips.types import Activity, DutyStatus
from tests.helpers import assert_compliant, at

RULES = HosRules()
MPM = RULES.miles_per_minute


def activities(segments):
    return [segment.activity for segment in segments]


def miles_to_minutes(miles: float) -> int:
    return round(miles / MPM)


def test_short_trip_has_no_breaks_or_rests():
    segments = plan_duty_segments((100, 200), at(5, 6), 0)
    assert activities(segments) == [
        Activity.DRIVE_TO_PICKUP,
        Activity.PICKUP,
        Activity.DRIVE_TO_DROPOFF,
        Activity.DROPOFF,
    ]
    assert segments[1].minutes == RULES.pickup
    assert segments[3].minutes == RULES.dropoff
    assert segments[1].status == DutyStatus.ON_DUTY


def test_trip_starts_at_requested_time_and_is_contiguous():
    segments = plan_duty_segments((50, 50), at(5, 9, 30), 0)
    assert segments[0].start == at(5, 9, 30)
    assert_compliant(segments)


def test_thirty_minute_break_after_eight_driving_hours():
    segments = plan_duty_segments((0, 600), at(5, 6), 0)
    driving = [s for s in segments if s.status == DutyStatus.DRIVING]
    assert driving[0].minutes == RULES.break_after_driving
    assert segments[segments.index(driving[0]) + 1].activity == Activity.BREAK
    assert segments[segments.index(driving[0]) + 1].minutes == RULES.break_length


def test_pickup_resets_the_break_clock():
    segments = plan_duty_segments((400, 400), at(5, 6), 0)
    assert Activity.BREAK not in activities(segments)


def test_ten_hour_rest_after_eleven_driving_hours():
    segments = plan_duty_segments((0, 800), at(5, 6), 0)
    rest = next(s for s in segments if s.activity == Activity.REST)
    driven = sum(
        s.minutes for s in segments if s.start < rest.start and s.status == DutyStatus.DRIVING
    )
    assert driven == RULES.max_driving
    assert rest.minutes == RULES.daily_rest
    assert rest.status == DutyStatus.SLEEPER


def test_fourteen_hour_window_forces_rest_before_eleven_driving_hours():
    rules = HosRules(fuel_interval_miles=150, fuel_stop=90)
    segments = plan_duty_segments((0, 900), at(5, 6), 0, rules)
    rest = next(s for s in segments if s.activity == Activity.REST)
    assert (rest.start - segments[0].start).total_seconds() / 60 <= rules.driving_window + 90
    driven = sum(
        s.minutes for s in segments if s.end <= rest.start and s.status == DutyStatus.DRIVING
    )
    assert driven < rules.max_driving
    assert_compliant(segments, rules)


def test_fuel_stop_at_least_every_thousand_miles():
    segments = plan_duty_segments((0, 2500), at(5, 6), 0)
    fuel = [s for s in segments if s.activity == Activity.FUEL]
    assert len(fuel) == 2
    assert fuel[0].start_mile == pytest.approx(1000, abs=1)
    assert fuel[1].start_mile == pytest.approx(2000, abs=2)
    assert all(s.status == DutyStatus.ON_DUTY and s.minutes == RULES.fuel_stop for s in fuel)


def test_no_fuel_stop_for_trips_under_a_thousand_miles():
    segments = plan_duty_segments((300, 600), at(5, 6), 0)
    assert Activity.FUEL not in activities(segments)


def test_fuel_stop_counts_as_the_thirty_minute_break():
    segments = plan_duty_segments((0, 1100), at(5, 6), 0)
    fuel_index = next(i for i, s in enumerate(segments) if s.activity == Activity.FUEL)
    assert segments[fuel_index + 1].activity != Activity.BREAK


def test_driving_miles_add_up_to_route_distance():
    segments = plan_duty_segments((123.4, 987.6), at(5, 6), 12)
    driven = sum(s.miles for s in segments if s.status == DutyStatus.DRIVING)
    assert driven == pytest.approx(123.4 + 987.6, abs=1e-6)


def test_cycle_limit_triggers_thirty_four_hour_restart():
    segments = plan_duty_segments((50, 600), at(5, 8), 66)
    restart = next(s for s in segments if s.activity == Activity.RESTART)
    assert restart.minutes == RULES.restart_length
    assert restart.status == DutyStatus.OFF_DUTY
    assert restart.cycle_before == RULES.cycle_limit
    assert restart.cycle_after == 0


def test_full_cycle_at_start_restarts_before_any_work():
    segments = plan_duty_segments((0, 300), at(5, 8), 70)
    assert segments[0].activity == Activity.RESTART
    assert segments[0].start == at(5, 8)
    assert segments[1].activity == Activity.PICKUP


def test_driver_never_exceeds_cycle_limit():
    segments = plan_duty_segments((50, 600), at(5, 8), 66)
    assert max(s.cycle_after for s in segments) <= RULES.cycle_limit


def test_zero_distance_legs_still_log_pickup_and_dropoff():
    segments = plan_duty_segments((0, 0), at(5, 6), 0)
    assert activities(segments) == [Activity.PICKUP, Activity.DROPOFF]


def test_cycle_tracking_matches_on_duty_minutes():
    segments = plan_duty_segments((100, 200), at(5, 6), 10)
    assert segments[-1].cycle_after == 10 * 60 + sum(
        s.minutes for s in segments if s.status in (DutyStatus.DRIVING, DutyStatus.ON_DUTY)
    )


LEGS = (0, 5, 120, 480, 900, 1500, 2600)
CYCLES = (0, 35, 62, 69.5, 70)
STARTS = (at(5, 0), at(5, 6), at(5, 13, 45), at(5, 22, 10))


@pytest.mark.parametrize(
    ("pickup_miles", "dropoff_miles", "cycle", "start"),
    list(itertools.product(LEGS, LEGS, CYCLES, STARTS)),
)
def test_every_plan_obeys_all_hos_rules(pickup_miles, dropoff_miles, cycle, start):
    segments = plan_duty_segments((pickup_miles, dropoff_miles), start, cycle)
    assert_compliant(segments)
    driven = sum(s.miles for s in segments if s.status == DutyStatus.DRIVING)
    assert driven == pytest.approx(pickup_miles + dropoff_miles, abs=1e-6)
