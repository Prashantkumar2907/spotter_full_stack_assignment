from dataclasses import dataclass

from apps.trips.constants import MINUTES_PER_HOUR


@dataclass(frozen=True, slots=True)
class HosRules:
    speed_mph: float = 55.0
    max_driving: int = 11 * MINUTES_PER_HOUR
    driving_window: int = 14 * MINUTES_PER_HOUR
    break_after_driving: int = 8 * MINUTES_PER_HOUR
    break_length: int = 30
    daily_rest: int = 10 * MINUTES_PER_HOUR
    cycle_limit: int = 70 * MINUTES_PER_HOUR
    restart_length: int = 34 * MINUTES_PER_HOUR
    fuel_interval_miles: float = 1000.0
    fuel_stop: int = 30
    pickup: int = 60
    dropoff: int = 60
    log_increment: int = 15

    @property
    def miles_per_minute(self) -> float:
        return self.speed_mph / MINUTES_PER_HOUR


DEFAULT_RULES = HosRules()
