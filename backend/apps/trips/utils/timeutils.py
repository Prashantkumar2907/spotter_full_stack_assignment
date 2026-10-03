from datetime import datetime, timedelta
from math import ceil, floor

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


def ceil_to_step(value: float, step: int) -> int:
    return ceil(round(value, 6) / step) * step


def floor_to_step(value: float, step: int) -> int:
    return floor(round(value, 6) / step) * step


def ceil_datetime_to_step(moment: datetime, step: int) -> datetime:
    midnight = start_of_day(moment)
    elapsed = (moment - midnight).total_seconds() / 60
    return midnight + timedelta(minutes=ceil_to_step(elapsed, step))
