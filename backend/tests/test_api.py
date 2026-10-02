import pytest
from rest_framework.test import APIClient

from apps.trips import services
from apps.trips.api.throttles import ClientIpThrottle
from apps.trips.exceptions import LocationNotFound, UpstreamServiceError
from apps.trips.services.trip_service import TripPlanningService
from apps.trips.types import Place, Route
from tests.helpers import encode_polyline

ORIGIN = {"label": "Richmond, VA", "lat": 37.5407, "lng": -77.4360}
PICKUP = {"label": "Washington, DC", "lat": 38.9072, "lng": -77.0369}
DROPOFF = {"label": "Newark, NJ", "lat": 40.7357, "lng": -74.1724}
PLAN_URL = "/api/trips/plan/"


class FakeGeocoder:
    def __init__(self, known=None):
        self.known = known or {}
        self.queries = []

    def resolve(self, query):
        self.queries.append(query)
        if query not in self.known:
            raise LocationNotFound(f"Could not find a US location matching '{query}'")
        return self.known[query]

    def search(self, query, limit):
        return [Place(f"{query} City, VA", 37.0, -77.0)][:limit]


class FakeRouter:
    def route(self, waypoints):
        points = [(place.lat, place.lng) for place in waypoints]
        return Route(polyline=encode_polyline(points), leg_miles=(110.0, 230.0))


class BrokenRouter:
    def route(self, waypoints):
        raise UpstreamServiceError("The routing service is not reachable right now")


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def geocoder():
    return FakeGeocoder({"Dallas, TX": Place("Dallas, TX", 32.78, -96.8)})


@pytest.fixture
def wire(monkeypatch, geocoder):
    def install(router=None):
        service = TripPlanningService(geocoder, router or FakeRouter())
        monkeypatch.setattr(services, "get_trip_service", lambda: service)
        monkeypatch.setattr(services, "get_geocoding_service", lambda: geocoder)

    return install


def payload(**overrides):
    body = {
        "current_location": ORIGIN,
        "pickup_location": PICKUP,
        "dropoff_location": DROPOFF,
        "cycle_used_hours": 10,
        "start_time": "2026-10-05T06:00",
    }
    return {**body, **overrides}


def test_health(client):
    assert client.get("/api/health/").json() == {"status": "ok"}


def test_plan_returns_summary_route_stops_and_logs(client, wire):
    wire()
    response = client.post(PLAN_URL, payload(), format="json")
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"summary", "route", "stops", "logs"}
    assert body["summary"]["total_miles"] == 340.0
    assert body["route"]["precision"] == 6
    assert [w["role"] for w in body["route"]["waypoints"]] == ["current", "pickup", "dropoff"]
    assert [s["kind"] for s in body["stops"]] == ["start", "pickup", "dropoff"]
    assert body["logs"][0]["date"] == "2026-10-05"
    assert body["logs"][0]["from_location"] == "Richmond, VA"


def test_plan_accepts_free_text_locations_and_geocodes_them(client, wire, geocoder):
    wire()
    response = client.post(PLAN_URL, payload(dropoff_location="Dallas, TX"), format="json")
    assert response.status_code == 200
    assert geocoder.queries == ["Dallas, TX"]
    assert response.json()["route"]["waypoints"][2]["label"] == "Dallas, TX"


def test_plan_echoes_log_details_on_each_sheet(client, wire):
    wire()
    details = {"carrier_name": "Acme Freight", "vehicle_numbers": "T-100 / TR-22"}
    body = client.post(PLAN_URL, payload(log_details=details), format="json").json()
    assert body["logs"][0]["details"]["carrier_name"] == "Acme Freight"
    assert body["logs"][0]["details"]["vehicle_numbers"] == "T-100 / TR-22"


@pytest.mark.parametrize("hours", [-1, 70.5, "abc", None])
def test_plan_rejects_invalid_cycle_hours(client, wire, hours):
    wire()
    response = client.post(PLAN_URL, payload(cycle_used_hours=hours), format="json")
    assert response.status_code == 400
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert "cycle_used_hours" in error["fields"]


def test_plan_reports_every_missing_field(client, wire):
    wire()
    response = client.post(PLAN_URL, {}, format="json")
    fields = response.json()["error"]["fields"]
    assert {"current_location", "pickup_location", "dropoff_location", "cycle_used_hours"} <= set(
        fields
    )


@pytest.mark.parametrize(
    "location", ["", "   ", 5, {"label": "x"}, {"label": "x", "lat": 99, "lng": 0}]
)
def test_plan_rejects_invalid_locations(client, wire, location):
    wire()
    response = client.post(PLAN_URL, payload(pickup_location=location), format="json")
    assert response.status_code == 400
    assert "pickup_location" in response.json()["error"]["fields"]


def test_unknown_place_returns_422(client, wire):
    wire()
    response = client.post(PLAN_URL, payload(dropoff_location="Nowhereville"), format="json")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "location_not_found"


def test_upstream_failure_returns_502_with_message(client, wire):
    wire(BrokenRouter())
    response = client.post(PLAN_URL, payload(), format="json")
    assert response.status_code == 502
    assert response.json()["error"]["code"] == "upstream_unavailable"


def test_search_returns_results(client, wire):
    wire()
    response = client.get("/api/locations/search/", {"q": "Rich", "limit": 3})
    assert response.status_code == 200
    assert response.json()["results"][0]["label"] == "Rich City, VA"


def test_search_validates_limit(client, wire):
    wire()
    assert client.get("/api/locations/search/", {"q": "Rich", "limit": 99}).status_code == 400


def test_plan_is_rate_limited(client, wire, monkeypatch):
    wire()
    monkeypatch.setattr(ClientIpThrottle, "THROTTLE_RATES", {"plan": "2/min", "search": "2/min"})
    statuses = [client.post(PLAN_URL, payload(), format="json").status_code for _ in range(3)]
    assert statuses == [200, 200, 429]


def test_responses_are_gzipped_for_large_payloads(client, wire):
    wire()
    response = client.post(PLAN_URL, payload(), format="json", HTTP_ACCEPT_ENCODING="gzip")
    assert response.status_code == 200
