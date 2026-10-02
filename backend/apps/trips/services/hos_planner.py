from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime
from math import ceil, floor

from apps.trips.constants import MINUTES_PER_HOUR
from apps.trips.exceptions import PlanningInvariantError
from apps.trips.services.hos_rules import DEFAULT_RULES, HosRules
from apps.trips.types import Activity, DutySegment, DutyStatus
from apps.trips.utils.timeutils import add_minutes, minutes_between

MILE_EPSILON = 1e-6
MINUTE_ROUNDING_DIGITS = 6


@dataclass(slots=True)
class DriverState:
    clock: datetime
    shift_start: datetime
    cycle: int
    shift_driving: int = 0
    driving_since_break: int = 0
    miles_since_fuel: float = 0.0
    mile: float = 0.0


class Simulation:
    def __init__(self, rules: HosRules, start: datetime, cycle_minutes: int) -> None:
        self.rules = rules
        self.state = DriverState(clock=start, shift_start=start, cycle=cycle_minutes)
        self.segments: list[DutySegment] = []

    def drive(self, miles: float, activity: Activity) -> None:
        target = self.state.mile + miles
        while target - self.state.mile > MILE_EPSILON:
            minutes = self._driving_minutes_available(target)
            if minutes <= 0:
                self._take_required_rest()
                continue
            self._drive_for(minutes, target, activity)

    def work(self, minutes: int, activity: Activity) -> None:
        if self.state.cycle + minutes > self.rules.cycle_limit:
            self._restart()
        self._stay(
            DutyStatus.ON_DUTY,
            activity,
            minutes,
            cycle_after=self.state.cycle + minutes,
        )

    def _window_minutes_left(self) -> int:
        elapsed = minutes_between(self.state.shift_start, self.state.clock)
        return self.rules.driving_window - elapsed

    def _fuel_minutes_left(self) -> int:
        miles_left = self.rules.fuel_interval_miles - self.state.miles_since_fuel
        return floor(miles_left / self.rules.miles_per_minute)

    def _minutes_to_cover(self, target_mile: float) -> int:
        minutes = (target_mile - self.state.mile) / self.rules.miles_per_minute
        return ceil(round(minutes, MINUTE_ROUNDING_DIGITS))

    def _driving_minutes_available(self, target_mile: float) -> int:
        state, rules = self.state, self.rules
        return min(
            rules.max_driving - state.shift_driving,
            self._window_minutes_left(),
            rules.break_after_driving - state.driving_since_break,
            rules.cycle_limit - state.cycle,
            self._fuel_minutes_left(),
            self._minutes_to_cover(target_mile),
        )

    def _take_required_rest(self) -> None:
        state, rules = self.state, self.rules
        if rules.cycle_limit - state.cycle <= 0:
            self._restart()
        elif rules.max_driving - state.shift_driving <= 0 or self._window_minutes_left() <= 0:
            self._daily_rest()
        elif rules.break_after_driving - state.driving_since_break <= 0:
            self._break()
        elif self._fuel_minutes_left() <= 0:
            self._refuel()
        else:
            raise PlanningInvariantError("no driving capacity and no rest rule applies")

    def _drive_for(self, minutes: int, target_mile: float, activity: Activity) -> None:
        state = self.state
        miles = min(minutes * self.rules.miles_per_minute, target_mile - state.mile)
        self._record(
            DutyStatus.DRIVING,
            activity,
            minutes,
            end_mile=state.mile + miles,
            cycle_after=state.cycle + minutes,
        )
        state.shift_driving += minutes
        state.driving_since_break += minutes
        state.miles_since_fuel += miles

    def _stay(self, status: DutyStatus, activity: Activity, minutes: int, cycle_after: int) -> None:
        self._record(status, activity, minutes, end_mile=self.state.mile, cycle_after=cycle_after)
        if minutes >= self.rules.break_length:
            self.state.driving_since_break = 0

    def _record(
        self,
        status: DutyStatus,
        activity: Activity,
        minutes: int,
        *,
        end_mile: float,
        cycle_after: int,
    ) -> None:
        state = self.state
        end = add_minutes(state.clock, minutes)
        self.segments.append(
            DutySegment(
                status=status,
                activity=activity,
                start=state.clock,
                end=end,
                start_mile=state.mile,
                end_mile=end_mile,
                cycle_before=state.cycle,
                cycle_after=cycle_after,
            )
        )
        state.clock, state.cycle, state.mile = end, cycle_after, end_mile

    def _break(self) -> None:
        self._stay(
            DutyStatus.OFF_DUTY,
            Activity.BREAK,
            self.rules.break_length,
            self.state.cycle,
        )

    def _refuel(self) -> None:
        self.work(self.rules.fuel_stop, Activity.FUEL)
        self.state.miles_since_fuel = 0.0

    def _daily_rest(self) -> None:
        self._stay(DutyStatus.SLEEPER, Activity.REST, self.rules.daily_rest, self.state.cycle)
        self.state.shift_driving = 0
        self.state.shift_start = self.state.clock

    def _restart(self) -> None:
        self._stay(DutyStatus.OFF_DUTY, Activity.RESTART, self.rules.restart_length, 0)
        self.state.shift_driving = 0
        self.state.shift_start = self.state.clock


def plan_duty_segments(
    leg_miles: Sequence[float],
    start: datetime,
    cycle_used_hours: float,
    rules: HosRules = DEFAULT_RULES,
) -> list[DutySegment]:
    pickup_miles, dropoff_miles = leg_miles
    simulation = Simulation(rules, start, round(cycle_used_hours * MINUTES_PER_HOUR))
    simulation.drive(pickup_miles, Activity.DRIVE_TO_PICKUP)
    simulation.work(rules.pickup, Activity.PICKUP)
    simulation.drive(dropoff_miles, Activity.DRIVE_TO_DROPOFF)
    simulation.work(rules.dropoff, Activity.DROPOFF)
    return simulation.segments
