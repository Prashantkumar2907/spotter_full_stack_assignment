from array import array

import pytest

from apps.trips.services.places import PlaceIndex, PlaceRecord, describe_location, get_place_index
from apps.trips.services.route_path import RoutePath
from apps.trips.utils.geo import haversine_miles, interpolate, planar_miles
from apps.trips.utils.polyline import decode_polyline
from apps.trips.utils.timeutils import minute_of_day, next_midnight
from tests.helpers import at, encode_polyline

GOOGLE_SAMPLE = "_p~iF~ps|U_ulLnnqC_mqNvxq`@"


def test_decode_polyline_matches_reference_sample():
    lats, lngs = decode_polyline(GOOGLE_SAMPLE, precision=5)
    assert list(lats) == pytest.approx([38.5, 40.7, 43.252])
    assert list(lngs) == pytest.approx([-120.2, -120.95, -126.453])


def test_decode_polyline_round_trips_precision_six():
    points = [(37.538509, -77.434280), (38.907200, -77.036900), (40.735657, -74.172367)]
    lats, lngs = decode_polyline(encode_polyline(points))
    assert list(zip(lats, lngs, strict=True)) == pytest.approx(points)


def test_decode_empty_polyline_returns_empty_arrays():
    lats, lngs = decode_polyline("")
    assert len(lats) == len(lngs) == 0


def test_haversine_known_distance():
    assert haversine_miles(40.7128, -74.0060, 34.0522, -118.2437) == pytest.approx(2445, rel=0.01)


def test_planar_distance_close_to_haversine_for_short_hops():
    assert planar_miles(37.5, -77.4, 37.6, -77.3) == pytest.approx(
        haversine_miles(37.5, -77.4, 37.6, -77.3), rel=0.001
    )


def test_interpolate_midpoint():
    assert interpolate((0.0, 0.0), (10.0, 20.0), 0.5) == (5.0, 10.0)


def test_route_path_scales_to_reported_distance_and_interpolates():
    path = RoutePath(array("d", [0.0, 0.0, 0.0]), array("d", [0.0, 1.0, 2.0]), 200.0)
    assert path.point_at(0) == (0.0, 0.0)
    assert path.point_at(100) == pytest.approx((0.0, 1.0))
    assert path.point_at(150) == pytest.approx((0.0, 1.5))
    assert path.point_at(500) == (0.0, 2.0)
    assert path.point_at(-5) == (0.0, 0.0)


def test_route_path_with_single_point_returns_it():
    path = RoutePath(array("d", [10.0]), array("d", [20.0]), 0.0)
    assert path.point_at(0) == (10.0, 20.0)


def test_time_helpers():
    assert minute_of_day(at(5, 13, 45)) == 13 * 60 + 45
    assert next_midnight(at(5, 23, 59)) == at(6, 0)


def test_place_index_returns_nearest_record():
    index = PlaceIndex(
        [PlaceRecord("Near", "VA", 37.5, -77.4), PlaceRecord("Far", "VA", 39.0, -77.4)]
    )
    assert index.nearest(37.52, -77.41).name == "Near"


def test_place_index_searches_beyond_neighbouring_cells():
    index = PlaceIndex([PlaceRecord("Remote", "NV", 39.0, -117.0)])
    assert index.nearest(37.0, -115.0).name == "Remote"


def test_place_index_empty_returns_none():
    assert PlaceIndex([]).nearest(37.0, -77.0) is None


def test_real_dataset_resolves_known_cities():
    assert get_place_index().nearest(37.5407, -77.4360).label == "Richmond, VA"
    assert describe_location(40.7357, -74.1724) == "Newark, NJ"
    assert describe_location(41.8781, -87.6298).endswith(", IL")
