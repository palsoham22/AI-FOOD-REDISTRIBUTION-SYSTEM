from django.urls import path
from .views import RegisterView, LoginView
from .views import AvailableDeliveryPartnersView
from .views import DeliveryProfileView
from .views import DeliveryDashboardStatsView
from .views import UpdateLocationView
from .views import DriverLocationView

urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path("login/", LoginView.as_view(), name="login"),

    path(
        "available-delivery-partners/",
        AvailableDeliveryPartnersView.as_view(),
        name="available-delivery-partners"
    ),

    path(
        "delivery/profile/",
        DeliveryProfileView.as_view(),
    ),

    path(
        "delivery/dashboard/",
        DeliveryDashboardStatsView.as_view(),
    ),

    path(
        "delivery/update-location/",
        UpdateLocationView.as_view(),
        name="update-location",
    ),

    path(
        "delivery/location/<int:driver_id>/",
        DriverLocationView.as_view(),
        name="driver-location",
    ),

]