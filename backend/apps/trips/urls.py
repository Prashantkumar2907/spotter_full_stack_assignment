from django.urls import path

from apps.trips.api.views import HealthView, LocationSearchView, TripPlanView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("locations/search/", LocationSearchView.as_view(), name="location-search"),
    path("trips/plan/", TripPlanView.as_view(), name="trip-plan"),
]
