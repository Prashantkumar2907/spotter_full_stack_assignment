import csv
from collections import defaultdict
from collections.abc import Iterator
from dataclasses import dataclass
from functools import lru_cache
from math import cos, floor, inf, radians
from pathlib import Path

from apps.trips.constants import MILES_PER_DEGREE_LATITUDE
from apps.trips.utils.geo import planar_miles

PLACES_PATH = Path(__file__).resolve().parent.parent / "data" / "us_places.csv"
CELL_DEGREES = 0.25
MAX_SEARCH_RINGS = 40
MIN_COSINE = 0.2


@dataclass(frozen=True, slots=True)
class PlaceRecord:
    name: str
    state: str
    lat: float
    lng: float

    @property
    def label(self) -> str:
        return f"{self.name}, {self.state}"


class PlaceIndex:
    def __init__(self, records: list[PlaceRecord]) -> None:
        self._cells: dict[tuple[int, int], list[PlaceRecord]] = defaultdict(list)
        for record in records:
            self._cells[self._cell(record.lat, record.lng)].append(record)

    @staticmethod
    def _cell(lat: float, lng: float) -> tuple[int, int]:
        return floor(lat / CELL_DEGREES), floor(lng / CELL_DEGREES)

    @staticmethod
    def _ring(center: tuple[int, int], radius: int) -> Iterator[tuple[int, int]]:
        row, column = center
        if radius == 0:
            yield center
            return
        for offset in range(-radius, radius + 1):
            yield row - radius, column + offset
            yield row + radius, column + offset
        for offset in range(-radius + 1, radius):
            yield row + offset, column - radius
            yield row + offset, column + radius

    def nearest(self, lat: float, lng: float) -> PlaceRecord | None:
        center = self._cell(lat, lng)
        cell_miles = CELL_DEGREES * MILES_PER_DEGREE_LATITUDE * max(MIN_COSINE, cos(radians(lat)))
        best, best_distance = None, inf
        for radius in range(MAX_SEARCH_RINGS + 1):
            if best is not None and (radius - 1) * cell_miles > best_distance:
                break
            for cell in self._ring(center, radius):
                for record in self._cells.get(cell, ()):
                    distance = planar_miles(lat, lng, record.lat, record.lng)
                    if distance < best_distance:
                        best, best_distance = record, distance
        return best


def load_records(path: Path = PLACES_PATH) -> list[PlaceRecord]:
    with path.open(newline="", encoding="utf-8") as handle:
        return [
            PlaceRecord(row["name"], row["state"], float(row["lat"]), float(row["lng"]))
            for row in csv.DictReader(handle)
        ]


@lru_cache(maxsize=1)
def get_place_index() -> PlaceIndex:
    return PlaceIndex(load_records())


def describe_location(lat: float, lng: float) -> str:
    record = get_place_index().nearest(lat, lng)
    return record.label if record else f"{lat:.3f}, {lng:.3f}"
