import pytest
import responses

from apps.trips.exceptions import LocationNotFound, UpstreamServiceError
from apps.trips.services.geocoding import PHOTON_URL, GeocodingService, format_label


def feature(name, lng, lat, **properties):
    base = {"name": name, "countrycode": "US", "osm_value": "city", "state": "Virginia"}
    return {
        "geometry": {"coordinates": [lng, lat]},
        "properties": {**base, **properties},
    }


def mock_photon(features, status=200):
    responses.add(responses.GET, PHOTON_URL, json={"features": features}, status=status)


@responses.activate
def test_search_returns_us_places_with_state_abbreviation():
    mock_photon([feature("Richmond", -77.43, 37.54)])
    places = GeocodingService().search("Richmond, VA")
    assert [(p.label, p.lat, p.lng) for p in places] == [("Richmond, VA", 37.54, -77.43)]


@responses.activate
def test_search_filters_counties_and_foreign_results_and_duplicates():
    mock_photon(
        [
            feature("Richmond", -77.43, 37.54),
            feature("Richmond", -76.7, 37.9, osm_value="county"),
            feature("Richmond", -123.1, 49.1, countrycode="CA", state="British Columbia"),
            feature("Richmond", -77.4, 37.5, osm_value="town"),
        ]
    )
    places = GeocodingService().search("Richmond")
    assert [p.label for p in places] == ["Richmond, VA"]


@responses.activate
def test_search_skips_stations_and_roads():
    mock_photon(
        [
            feature(
                "Chicago",
                -87.6,
                41.9,
                osm_key="railway",
                osm_value="station",
                street="W Chicago Ave",
            ),
            feature("Chicago Avenue", -87.7, 41.9, osm_key="highway", osm_value="residential"),
            feature("Chicago", -87.62, 41.87, osm_key="place", state="Illinois"),
        ]
    )
    assert [p.label for p in GeocodingService().search("Chicago")] == ["Chicago, IL"]


@responses.activate
def test_search_respects_limit():
    mock_photon([feature(f"Place {i}", -77.0 - i, 37.0) for i in range(10)])
    assert len(GeocodingService().search("Place", limit=3)) == 3


@responses.activate
def test_search_sends_us_bounding_box_and_user_agent():
    mock_photon([])
    GeocodingService().search("Anywhere")
    request = responses.calls[0].request
    assert "bbox=-125%2C24%2C-66%2C50" in request.url
    assert request.headers["User-Agent"].startswith("Milemark")


@responses.activate
def test_repeated_search_is_served_from_cache():
    mock_photon([feature("Richmond", -77.43, 37.54)])
    service = GeocodingService()
    service.search("Richmond, VA")
    service.search("  richmond,   va ")
    assert len(responses.calls) == 1


def test_short_queries_skip_the_network():
    assert GeocodingService().search("a") == []


@responses.activate
def test_resolve_returns_first_match():
    mock_photon([feature("Dallas", -96.8, 32.78, state="Texas")])
    assert GeocodingService().resolve("Dallas").label == "Dallas, TX"


@responses.activate
def test_resolve_raises_when_nothing_matches():
    mock_photon([])
    with pytest.raises(LocationNotFound):
        GeocodingService().resolve("zzzzzz")


@responses.activate
def test_upstream_failure_becomes_service_error():
    mock_photon([], status=503)
    with pytest.raises(UpstreamServiceError):
        GeocodingService().search("Richmond")


@responses.activate
def test_unexpected_payload_becomes_service_error():
    responses.add(responses.GET, PHOTON_URL, json={"message": "bad"}, status=400)
    with pytest.raises(UpstreamServiceError):
        GeocodingService().search("Richmond")


@responses.activate
def test_unreadable_reply_becomes_service_error():
    responses.add(responses.GET, PHOTON_URL, body="<html>", status=200)
    with pytest.raises(UpstreamServiceError):
        GeocodingService().search("Richmond")


def test_format_label_for_street_address_without_duplicates():
    label = format_label(
        {
            "name": "White House",
            "housenumber": "1600",
            "street": "Pennsylvania Avenue Northwest",
            "city": "Washington",
            "state": "District of Columbia",
        }
    )
    assert label == "White House, 1600 Pennsylvania Avenue Northwest, Washington, DC"
