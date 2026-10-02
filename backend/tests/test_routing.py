import pytest
import responses

from apps.trips.constants import METERS_PER_MILE
from apps.trips.exceptions import RouteNotFound, UpstreamServiceError
from apps.trips.services.routing import OSRM_URL, RoutingService, parse_route
from tests.helpers import encode_polyline, place

ROUTE_URL_PATTERN = f"{OSRM_URL}/route/v1/driving/"


def osrm_payload(*leg_miles):
    return {
        "code": "Ok",
        "routes": [
            {
                "geometry": encode_polyline([(37.0, -77.0), (38.0, -77.0)]),
                "legs": [{"distance": miles * METERS_PER_MILE} for miles in leg_miles],
            }
        ],
    }


def test_parse_route_converts_meters_to_miles():
    route = parse_route(osrm_payload(100, 250))
    assert route.leg_miles == pytest.approx((100, 250))
    assert route.total_miles == pytest.approx(350)


def test_parse_route_reports_unroutable_pairs():
    with pytest.raises(RouteNotFound):
        parse_route({"code": "NoRoute"})


def test_parse_route_rejects_unknown_codes():
    with pytest.raises(UpstreamServiceError):
        parse_route({"code": "InvalidQuery"})


@responses.activate
def test_route_requests_full_polyline_for_all_waypoints_and_caches():
    responses.add(
        responses.GET,
        ROUTE_URL_PATTERN + "-77.000000,37.000000;-76.000000,38.000000",
        json=osrm_payload(90),
    )
    service = RoutingService()
    waypoints = [place("A", 37.0, -77.0), place("B", 38.0, -76.0)]
    first = service.route(waypoints)
    second = service.route(waypoints)
    assert first == second
    assert len(responses.calls) == 1
    assert "overview=full" in responses.calls[0].request.url
    assert "geometries=polyline6" in responses.calls[0].request.url


def test_route_needs_two_waypoints():
    with pytest.raises(ValueError):
        RoutingService().route([place()])


@responses.activate
def test_route_translates_server_errors():
    responses.add(
        responses.GET,
        ROUTE_URL_PATTERN + "-77.000000,37.000000;-76.000000,38.000000",
        status=502,
    )
    with pytest.raises(UpstreamServiceError):
        RoutingService().route([place("A", 37.0, -77.0), place("B", 38.0, -76.0)])
