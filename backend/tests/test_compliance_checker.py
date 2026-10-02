import pytest

from apps.trips.services.hos_planner import plan_duty_segments
from apps.trips.services.hos_rules import HosRules
from tests.helpers import assert_compliant, at

LENIENT = HosRules(
    max_driving=16 * 60, driving_window=20 * 60, break_after_driving=12 * 60, cycle_limit=90 * 60
)


def lenient_plan(legs, cycle=0):
    return plan_duty_segments(legs, at(5, 6), cycle, LENIENT)


def test_checker_flags_driving_beyond_eleven_hours():
    with pytest.raises(AssertionError):
        assert_compliant(lenient_plan((0, 600)))


def test_checker_flags_missing_thirty_minute_break():
    segments = plan_duty_segments((0, 600), at(5, 6), 0, HosRules(break_after_driving=11 * 60))
    with pytest.raises(AssertionError):
        assert_compliant(segments)


def test_checker_flags_cycle_overrun():
    with pytest.raises(AssertionError):
        assert_compliant(lenient_plan((0, 300), cycle=69))


def test_checker_flags_fuel_gap_beyond_a_thousand_miles():
    segments = plan_duty_segments((0, 1200), at(5, 6), 0, HosRules(fuel_interval_miles=5000))
    with pytest.raises(AssertionError):
        assert_compliant(segments)


def test_checker_accepts_a_legal_plan():
    assert_compliant(plan_duty_segments((0, 1500), at(5, 6), 20))
