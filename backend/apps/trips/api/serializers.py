from datetime import datetime

from rest_framework import serializers

from apps.trips.constants import MAX_CYCLE_HOURS, MAX_SEARCH_RESULTS
from apps.trips.types import LogDetails, Place, TripRequest
from apps.trips.utils.timeutils import truncate_to_minute

MAX_TEXT_LENGTH = 200
MAX_LABEL_LENGTH = 300


class PlaceSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=MAX_LABEL_LENGTH)
    lat = serializers.FloatField(min_value=-90, max_value=90)
    lng = serializers.FloatField(min_value=-180, max_value=180)

    def create(self, validated_data: dict) -> Place:
        return Place(**validated_data)


class LocationField(serializers.Field):
    default_error_messages = {"invalid": "Enter a place name or choose one from the list."}

    def to_internal_value(self, data):
        if isinstance(data, str):
            return self._text(data)
        if isinstance(data, dict):
            place = PlaceSerializer(data=data)
            place.is_valid(raise_exception=True)
            return place.create(place.validated_data)
        self.fail("invalid")

    def _text(self, data: str) -> str:
        text = " ".join(data.split())
        if not text or len(text) > MAX_TEXT_LENGTH:
            self.fail("invalid")
        return text

    def to_representation(self, value):
        return value


class LogDetailsSerializer(serializers.Serializer):
    driver_name = serializers.CharField(
        max_length=MAX_TEXT_LENGTH, required=False, allow_blank=True
    )
    carrier_name = serializers.CharField(
        max_length=MAX_TEXT_LENGTH, required=False, allow_blank=True
    )
    main_office_address = serializers.CharField(
        max_length=MAX_TEXT_LENGTH, required=False, allow_blank=True
    )
    home_terminal_address = serializers.CharField(
        max_length=MAX_TEXT_LENGTH, required=False, allow_blank=True
    )
    vehicle_numbers = serializers.CharField(
        max_length=MAX_TEXT_LENGTH, required=False, allow_blank=True
    )
    shipping_document = serializers.CharField(
        max_length=MAX_TEXT_LENGTH, required=False, allow_blank=True
    )
    commodity = serializers.CharField(max_length=MAX_TEXT_LENGTH, required=False, allow_blank=True)


class TripRequestSerializer(serializers.Serializer):
    current_location = LocationField()
    pickup_location = LocationField()
    dropoff_location = LocationField()
    cycle_used_hours = serializers.FloatField(min_value=0, max_value=MAX_CYCLE_HOURS)
    start_time = serializers.DateTimeField(required=False)
    log_details = LogDetailsSerializer(required=False)

    def to_trip_request(self) -> TripRequest:
        data = self.validated_data
        start = data.get("start_time") or datetime.now()
        return TripRequest(
            current=data["current_location"],
            pickup=data["pickup_location"],
            dropoff=data["dropoff_location"],
            cycle_used_hours=data["cycle_used_hours"],
            start_time=truncate_to_minute(start),
            log_details=LogDetails(**data.get("log_details", {})),
        )


class LocationSearchSerializer(serializers.Serializer):
    q = serializers.CharField(max_length=MAX_TEXT_LENGTH, allow_blank=True)
    limit = serializers.IntegerField(min_value=1, max_value=MAX_SEARCH_RESULTS, required=False)
