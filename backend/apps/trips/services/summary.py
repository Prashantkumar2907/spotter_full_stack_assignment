from apps.trips.constants import MILES_DECIMALS
from apps.trips.types import Activity, DutySegment, DutyStatus, SummaryView
from apps.trips.utils.timeutils import minutes_between


def minutes_with_status(segments: list[DutySegment], status: DutyStatus) -> int:
    return sum(segment.minutes for segment in segments if segment.status == status)


def count_activity(segments: list[DutySegment], activity: Activity) -> int:
    return sum(1 for segment in segments if segment.activity == activity)


def build_summary(segments: list[DutySegment], total_miles: float, days: int) -> SummaryView:
    first, last = segments[0], segments[-1]
    return SummaryView(
        total_miles=round(total_miles, MILES_DECIMALS),
        driving_minutes=minutes_with_status(segments, DutyStatus.DRIVING),
        on_duty_minutes=minutes_with_status(segments, DutyStatus.ON_DUTY),
        total_minutes=minutes_between(first.start, last.end),
        start=first.start.isoformat(),
        end=last.end.isoformat(),
        days=days,
        fuel_stops=count_activity(segments, Activity.FUEL),
        breaks=count_activity(segments, Activity.BREAK),
        rests=count_activity(segments, Activity.REST),
        restarts=count_activity(segments, Activity.RESTART),
    )
