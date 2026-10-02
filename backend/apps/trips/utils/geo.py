from math import asin, cos, radians, sin, sqrt

from apps.trips.constants import EARTH_RADIUS_MILES


def haversine_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    return 2 * EARTH_RADIUS_MILES * asin(sqrt(a))


def planar_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    mean_lat = radians((lat1 + lat2) / 2)
    d_x = radians(lng2 - lng1) * cos(mean_lat)
    d_y = radians(lat2 - lat1)
    return EARTH_RADIUS_MILES * sqrt(d_x * d_x + d_y * d_y)


def interpolate(start: tuple[float, float], end: tuple[float, float], fraction: float):
    return (
        start[0] + (end[0] - start[0]) * fraction,
        start[1] + (end[1] - start[1]) * fraction,
    )
