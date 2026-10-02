from collections import defaultdict
from collections.abc import Iterator
from dataclasses import dataclass
from datetime import datetime

from apps.trips.constants import (
    HOURS_DECIMALS,
    MAX_CYCLE_HOURS,
    MILES_DECIMALS,
    MINUTES_PER_DAY,
    MINUTES_PER_HOUR,
)
from apps.trips.services.labels import ACTIVITY_REMARKS
from apps.trips.services.locations import LocationResolver
from apps.trips.types import (
    Activity,
    DailyLog,
    DutySegment,
    DutyStatus,
    LogDetails,
    LogSegmentView,
    RecapView,
    RemarkView,
)
from apps.trips.utils.timeutils import minutes_between, next_midnight, start_of_day

ON_DUTY_STATUSES = (DutyStatus.DRIVING, DutyStatus.ON_DUTY)
RECAP_WINDOW_DAYS = 5


@dataclass(frozen=True, slots=True)
class DayPiece:
    segment: DutySegment
    start: datetime
    end: datetime
    start_mile: float
    end_mile: float

    @property
    def begins_segment(self) -> bool:
        return self.start == self.segment.start

    @property
    def minutes(self) -> int:
        return minutes_between(self.start, self.end)


def opening_segment(first: DutySegment, opening: datetime) -> DutySegment:
    return DutySegment(
        status=DutyStatus.OFF_DUTY,
        activity=Activity.BEFORE_TRIP,
        start=opening,
        end=first.start,
        start_mile=first.start_mile,
        end_mile=first.start_mile,
        cycle_before=first.cycle_before,
        cycle_after=first.cycle_before,
    )


def closing_segment(last: DutySegment) -> DutySegment:
    return DutySegment(
        status=DutyStatus.OFF_DUTY,
        activity=Activity.AFTER_TRIP,
        start=last.end,
        end=next_midnight(last.end),
        start_mile=last.end_mile,
        end_mile=last.end_mile,
        cycle_before=last.cycle_after,
        cycle_after=last.cycle_after,
    )


def pad_to_whole_days(segments: list[DutySegment]) -> list[DutySegment]:
    first, last = segments[0], segments[-1]
    opening = start_of_day(first.start)
    leading = [opening_segment(first, opening)] if first.start > opening else []
    trailing = [closing_segment(last)] if last.end != start_of_day(last.end) else []
    return [*leading, *segments, *trailing]


def split_at_midnights(segment: DutySegment) -> Iterator[DayPiece]:
    total = segment.end - segment.start
    cursor = segment.start
    while cursor < segment.end:
        piece_end = min(next_midnight(cursor), segment.end)
        start_fraction = (cursor - segment.start) / total
        end_fraction = (piece_end - segment.start) / total
        yield DayPiece(
            segment,
            cursor,
            piece_end,
            segment.start_mile + segment.miles * start_fraction,
            segment.start_mile + segment.miles * end_fraction,
        )
        cursor = piece_end


def group_by_day(segments: list[DutySegment]) -> dict[datetime, list[DayPiece]]:
    days: dict[datetime, list[DayPiece]] = defaultdict(list)
    for segment in segments:
        for piece in split_at_midnights(segment):
            days[start_of_day(piece.start)].append(piece)
    return days


def minutes_by_status(pieces: list[DayPiece]) -> dict[DutyStatus, int]:
    totals = {status: 0 for status in DutyStatus}
    for piece in pieces:
        totals[piece.segment.status] += piece.minutes
    return totals


def hours(minutes: float) -> float:
    return round(minutes / MINUTES_PER_HOUR, HOURS_DECIMALS)


def daily_totals(pieces: list[DayPiece]) -> dict[str, float]:
    minutes = minutes_by_status(pieces)
    totals = {status.value: hours(minutes[status]) for status in DutyStatus}
    others = sum(value for key, value in totals.items() if key != DutyStatus.OFF_DUTY)
    totals[DutyStatus.OFF_DUTY.value] = round(
        MINUTES_PER_DAY / MINUTES_PER_HOUR - others, HOURS_DECIMALS
    )
    return totals


def cycle_minutes_at_end(piece: DayPiece) -> int:
    segment = piece.segment
    if segment.status in ON_DUTY_STATUSES:
        return segment.cycle_before + minutes_between(segment.start, piece.end)
    return segment.cycle_after if piece.end == segment.end else segment.cycle_before


def build_segment_views(day: datetime, pieces: list[DayPiece]) -> list[LogSegmentView]:
    return [
        LogSegmentView(
            status=piece.segment.status.value,
            activity=piece.segment.activity.value,
            start_minute=minutes_between(day, piece.start),
            end_minute=minutes_between(day, piece.end),
        )
        for piece in pieces
    ]


def build_remarks(
    day: datetime, pieces: list[DayPiece], resolver: LocationResolver
) -> list[RemarkView]:
    return [
        RemarkView(
            minute=minutes_between(day, piece.start),
            location=resolver.place_at(piece.start_mile).label,
            note=ACTIVITY_REMARKS[piece.segment.activity],
        )
        for piece in pieces
        if piece.begins_segment and piece.segment.activity != Activity.BEFORE_TRIP
    ]


def build_recap(pieces: list[DayPiece], daily_on_duty: list[float]) -> RecapView:
    cycle_total = hours(cycle_minutes_at_end(pieces[-1]))
    window = daily_on_duty[-RECAP_WINDOW_DAYS:]
    restart = any(
        piece.segment.activity == Activity.RESTART and piece.end == piece.segment.end
        for piece in pieces
    )
    return RecapView(
        on_duty_today=daily_on_duty[-1],
        cycle_total=cycle_total,
        available_tomorrow=max(0.0, round(MAX_CYCLE_HOURS - cycle_total, HOURS_DECIMALS)),
        last_five_days=round(sum(window), HOURS_DECIMALS),
        restart_taken=restart,
    )


def on_duty_hours(pieces: list[DayPiece]) -> float:
    minutes = minutes_by_status(pieces)
    return hours(sum(minutes[status] for status in ON_DUTY_STATUSES))


def build_daily_logs(
    segments: list[DutySegment], resolver: LocationResolver, details: LogDetails
) -> list[DailyLog]:
    days = group_by_day(pad_to_whole_days(segments))
    daily_on_duty: list[float] = []
    logs: list[DailyLog] = []
    for number, (day, pieces) in enumerate(days.items(), start=1):
        daily_on_duty.append(on_duty_hours(pieces))
        logs.append(
            DailyLog(
                date=day.date().isoformat(),
                day_number=number,
                from_location=resolver.place_at(pieces[0].start_mile).label,
                to_location=resolver.place_at(pieces[-1].end_mile).label,
                total_miles=round(sum(piece_miles(p) for p in pieces), MILES_DECIMALS),
                totals=daily_totals(pieces),
                segments=build_segment_views(day, pieces),
                remarks=build_remarks(day, pieces, resolver),
                recap=build_recap(pieces, daily_on_duty),
                details=details,
            )
        )
    return logs


def piece_miles(piece: DayPiece) -> float:
    if piece.segment.status != DutyStatus.DRIVING:
        return 0.0
    return piece.end_mile - piece.start_mile
