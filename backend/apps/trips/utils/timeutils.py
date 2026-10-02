from datetime import datetime, timedelta

from apps.trips.constants import MINUTES_PER_DAY


def start_of_day(moment: datetime) -> datetime:
    return moment.replace(hour=0, minute=0, second=0, microsecond=0)


def truncate_to_minute(moment: datetime) -> datetime:
    return moment.replace(second=0, microsecond=0)


def minutes_between(start: datetime, end: datetime) -> int:
    return round((end - start).total_seconds() / 60)


def add_minutes(moment: datetime, minutes: int) -> datetime:
    return moment + timedelta(minutes=minutes)


def minute_of_day(moment: datetime) -> int:
    return minutes_between(start_of_day(moment), moment)


def next_midnight(moment: datetime) -> datetime:
    return start_of_day(moment) + timedelta(minutes=MINUTES_PER_DAY)
