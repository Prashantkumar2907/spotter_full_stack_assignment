import pytest

from apps.trips.services.hos_planner import plan_duty_segments
from apps.trips.services.logbook import build_daily_logs, pad_to_whole_days
from apps.trips.types import Activity, DutyStatus, LogDetails, Place
from tests.helpers import at, mile_resolver

DETAILS = LogDetails(carrier_name="Acme Freight")


def build(legs, start, cycle=0, waypoints=()):
    segments = plan_duty_segments(legs, start, cycle)
    resolver = mile_resolver(sum(legs), waypoints)
    return segments, build_daily_logs(segments, resolver, DETAILS)


def test_single_day_log_fills_the_whole_day():
    _, logs = build((100, 200), at(5, 6))
    assert len(logs) == 1
    log = logs[0]
    assert log.date == "2026-10-05"
    assert log.segments[0].start_minute == 0
    assert log.segments[-1].end_minute == 1440
    assert log.segments[0].status == DutyStatus.OFF_DUTY.value


def test_segments_are_contiguous_within_each_day():
    _, logs = build((0, 2600), at(5, 7, 20), 10)
    for log in logs:
        assert log.segments[0].start_minute == 0
        assert log.segments[-1].end_minute == 1440
        for left, right in zip(log.segments, log.segments[1:], strict=False):
            assert left.end_minute == right.start_minute


def test_daily_totals_sum_to_twenty_four_hours():
    _, logs = build((0, 2600), at(5, 7, 20), 10)
    assert len(logs) > 1
    for log in logs:
        assert sum(log.totals.values()) == pytest.approx(24.0, abs=1e-9)


def test_totals_match_known_day():
    _, logs = build((0, 55 * 4), at(5, 6))
    totals = logs[0].totals
    assert totals["driving"] == pytest.approx(4.0)
    assert totals["on_duty"] == pytest.approx(2.0)
    assert totals["sleeper"] == 0
    assert totals["off_duty"] == pytest.approx(18.0)


def test_total_miles_per_day_add_up_to_trip_distance():
    _, logs = build((200, 2400), at(5, 8))
    assert sum(log.total_miles for log in logs) == pytest.approx(2600, abs=0.5 * len(logs))


def test_driving_across_midnight_is_split_between_days():
    _, logs = build((0, 55 * 8), at(5, 20))
    assert len(logs) == 2
    first_driving = next(s for s in logs[0].segments if s.status == "driving")
    assert first_driving.end_minute == 1440
    second_driving = next(s for s in logs[1].segments if s.status == "driving")
    assert second_driving.start_minute == 0


def test_remarks_record_each_change_of_duty_with_location():
    origin = Place("Richmond, VA", 37.0, -100.0)
    _, logs = build((0, 55 * 4), at(5, 6), waypoints=[(0.0, origin)])
    notes = [(r.minute, r.location, r.note) for r in logs[0].remarks]
    assert notes[0] == (360, "Richmond, VA", "Pickup, loading (on duty)")
    assert [n[0] for n in notes] == sorted(n[0] for n in notes)
    assert notes[-1][2] == "Trip complete, off duty"


def test_leading_off_duty_has_no_remark_but_continuation_across_midnight_has_none():
    _, logs = build((0, 55 * 8), at(5, 20))
    assert all(r.minute > 0 for r in logs[0].remarks)
    assert logs[1].remarks[0].minute > 0


def test_recap_tracks_cycle_hours_including_prior_use():
    _, logs = build((0, 55 * 4), at(5, 6), cycle=20)
    recap = logs[0].recap
    assert recap.on_duty_today == pytest.approx(6.0)
    assert recap.cycle_total == pytest.approx(26.0)
    assert recap.available_tomorrow == pytest.approx(44.0)
    assert not recap.restart_taken


def test_recap_flags_day_when_restart_completes():
    segments, logs = build((50, 600), at(5, 8), cycle=66)
    restart = next(s for s in segments if s.activity == Activity.RESTART)
    restart_day = logs[(restart.end.date() - segments[0].start.date()).days]
    assert restart_day.recap.restart_taken
    assert restart_day.recap.cycle_total < 20


def test_recap_cycle_total_never_exceeds_seventy():
    _, logs = build((50, 3000), at(5, 8), cycle=66)
    assert max(log.recap.cycle_total for log in logs) <= 70


def test_details_are_attached_to_every_sheet():
    _, logs = build((0, 2600), at(5, 7))
    assert {log.details.carrier_name for log in logs} == {"Acme Freight"}


def test_day_numbers_are_sequential():
    _, logs = build((0, 2600), at(5, 7))
    assert [log.day_number for log in logs] == list(range(1, len(logs) + 1))


def test_trip_ending_at_midnight_adds_no_empty_extra_day():
    segments = plan_duty_segments((0, 0), at(5, 22), 0)
    assert segments[-1].end == at(6, 0)
    assert pad_to_whole_days(segments)[-1].end == at(6, 0)
    assert len(build_daily_logs(segments, mile_resolver(0), DETAILS)) == 1


def test_trip_starting_at_midnight_has_no_leading_padding():
    segments = plan_duty_segments((0, 0), at(5, 0), 0)
    assert pad_to_whole_days(segments)[0] is segments[0]
