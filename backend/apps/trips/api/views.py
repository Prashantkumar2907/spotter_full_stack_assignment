from dataclasses import asdict

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.trips import services
from apps.trips.api.serializers import LocationSearchSerializer, TripRequestSerializer
from apps.trips.api.throttles import PlanThrottle, SearchThrottle
from apps.trips.constants import DEFAULT_SEARCH_RESULTS


class HealthView(APIView):
    def get(self, request: Request) -> Response:
        return Response({"status": "ok"})


class TripPlanView(APIView):
    throttle_classes = [PlanThrottle]

    def post(self, request: Request) -> Response:
        serializer = TripRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = services.get_trip_service().plan(serializer.to_trip_request())
        return Response(asdict(plan))


class LocationSearchView(APIView):
    throttle_classes = [SearchThrottle]

    def get(self, request: Request) -> Response:
        serializer = LocationSearchSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data
        limit = params.get("limit", DEFAULT_SEARCH_RESULTS)
        places = services.get_geocoding_service().search(params["q"], limit)
        return Response({"results": [asdict(place) for place in places]})
