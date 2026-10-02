from django.core.cache import cache

from apps.trips.constants import (
    CONTIGUOUS_US_BBOX,
    DEFAULT_SEARCH_RESULTS,
    GEOCODE_CACHE_SECONDS,
    IGNORED_OSM_KEYS,
    IGNORED_PLACE_TYPES,
    MAX_SEARCH_RESULTS,
    MIN_QUERY_LENGTH,
)
from apps.trips.exceptions import LocationNotFound, UpstreamServiceError
from apps.trips.types import Place
from apps.trips.utils.cache import cache_key
from apps.trips.utils.http import JsonHttpClient
from apps.trips.utils.us_states import STATE_ABBREVIATIONS

PHOTON_URL = "https://photon.komoot.io/api/"
US_COUNTRY_CODE = "US"
FETCH_PADDING = 4


def normalize_query(query: str) -> str:
    return " ".join(query.split())


def format_label(properties: dict) -> str:
    street = " ".join(filter(None, (properties.get("housenumber"), properties.get("street"))))
    state = properties.get("state")
    parts = (
        properties.get("name"),
        street,
        properties.get("city"),
        STATE_ABBREVIATIONS.get(state, state),
    )
    return ", ".join(dict.fromkeys(part for part in parts if part))


def is_usable(feature: dict) -> bool:
    properties = feature.get("properties", {})
    return (
        properties.get("countrycode") == US_COUNTRY_CODE
        and properties.get("osm_value") not in IGNORED_PLACE_TYPES
        and properties.get("osm_key") not in IGNORED_OSM_KEYS
    )


def to_place(feature: dict) -> Place:
    lng, lat = feature["geometry"]["coordinates"]
    return Place(format_label(feature["properties"]), lat, lng)


def unique_places(features: list[dict]) -> list[Place]:
    places: dict[str, Place] = {}
    for feature in features:
        if is_usable(feature):
            place = to_place(feature)
            places.setdefault(place.label, place)
    return list(places.values())


class GeocodingService:
    def __init__(self, http: JsonHttpClient | None = None, base_url: str = PHOTON_URL) -> None:
        self._http = http or JsonHttpClient("The location search service")
        self._base_url = base_url

    def search(self, query: str, limit: int = DEFAULT_SEARCH_RESULTS) -> list[Place]:
        normalized = normalize_query(query)
        if len(normalized) < MIN_QUERY_LENGTH:
            return []
        limit = min(limit, MAX_SEARCH_RESULTS)
        key = cache_key("geocode", limit, normalized.lower())
        cached = cache.get(key)
        if cached is not None:
            return cached
        places = unique_places(self._fetch(normalized, limit + FETCH_PADDING))[:limit]
        cache.set(key, places, GEOCODE_CACHE_SECONDS)
        return places

    def resolve(self, query: str) -> Place:
        places = self.search(query, limit=1)
        if not places:
            raise LocationNotFound(f"Could not find a US location matching '{query}'")
        return places[0]

    def _fetch(self, query: str, limit: int) -> list[dict]:
        payload = self._http.get_json(
            self._base_url,
            params={
                "q": query,
                "limit": limit,
                "lang": "en",
                "bbox": CONTIGUOUS_US_BBOX,
            },
        )
        features = payload.get("features")
        if features is None:
            raise UpstreamServiceError("The location search service sent an unexpected reply")
        return features
