from django.urls import path
from . import views
from .views import AcceptDonationView, DonateProductView, InventoryCreateView, OutForPickupListView, ScheduledDonationListView
from .views import InventoryCreateView, InventoryListView,InventoryDeleteView,InventoryUpdateView,DonationListView,AdminDashboardView,CSVUploadView,AcceptedDonationListView,SchedulePickupView,ConfirmPickupView,DonationHistoryView
from .views import OutForPickupListView,MarkDeliveredView
from .views import MyAssignedPickupsView,VerifyPickupOTPView,VerifyDeliveryOTPView
from .views import NGODashboardView
from .views import NotificationListView,MarkNotificationReadView,AdminInventoryView,AdminDonationsView,AdminAnalyticsView,AdminTransactionsView,ChangePasswordView
from .views import IndividualDonationView,MyIndividualDonationsView
from .views import IndividualDashboardView,UserProfileView

urlpatterns = [

    path(
        "add/",
        InventoryCreateView.as_view(),
        name="add_inventory"
    ),

    path(
        "list/",
        InventoryListView.as_view(),
        name="inventory_list"
    ),

    path(
        "delete/<int:pk>/",
        InventoryDeleteView.as_view(),
        name="delete_inventory"
    ),

    path(
        "update/<int:pk>/",
        InventoryUpdateView.as_view(),
        name="update_inventory"
    ),

    path(
        "donate/<int:pk>/",
        DonateProductView.as_view(),
        name="donate-product"
    ),

    path(
        "donations/",
        DonationListView.as_view(),
        name="donation-list"
    ),

    path(
        "accept/<int:pk>/",
        AcceptDonationView.as_view(),
        name="accept-donation"
    ),

    path(
        "admin-dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard"
    ),

    path(
        "upload-csv/",
        CSVUploadView.as_view(),
        name="upload-csv"
    ),

    path(
        "accepted/",
        AcceptedDonationListView.as_view()
    ),

    path(
        "schedule/<int:id>/",
        SchedulePickupView.as_view()
    ),

    path(
        "confirm/<int:id>/",
        ConfirmPickupView.as_view()
    ),

    path(
        "scheduled/",
        ScheduledDonationListView.as_view()
    ),

    path(
        "history/",
        DonationHistoryView.as_view()
    ),

    path(
        "start-pickup/<int:id>/",
        views.start_pickup
    ),

    path(
        "out-for-pickup/",
        OutForPickupListView.as_view()
    ),

    path(
        "mark-delivered/<int:id>/",
        MarkDeliveredView.as_view()
    ),

    path(
        "barcode/<str:barcode>/",
        views.BarcodeLookupView.as_view(),
        name="barcode-lookup"
    ),

    path(
        "delivery/my-pickups/",
        MyAssignedPickupsView.as_view(),
        name="my-pickups",
    ),

    path(
        "verify-pickup-otp/<int:id>/",
        VerifyPickupOTPView.as_view(),
        name="verify-pickup-otp",
    ),

    path(
        "verify-delivery-otp/<int:id>/",
        VerifyDeliveryOTPView.as_view(),
        name="verify-delivery-otp",
    ),

    path(
        "ngo/dashboard/",
        NGODashboardView.as_view(),
    ),

    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notifications"
    ),

    path(
        "notifications/<int:pk>/read/",
        MarkNotificationReadView.as_view(),
        name="mark_notification_read"
    ),

    path(
        "admin/inventory/",
        AdminInventoryView.as_view(),
        name="admin-inventory",
    ),

    path(
        "admin/donations/",
        AdminDonationsView.as_view(),
        name="admin-donations",
    ),

    path(
        "admin/analytics/",
        AdminAnalyticsView.as_view()
    ),

    path(
        "admin/transactions/",
        AdminTransactionsView.as_view(),
        name="admin-transactions",
    ),

    path(
    "profile/",
    UserProfileView.as_view()
),

    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),

    path(
        "individual/donate/",
        IndividualDonationView.as_view()
    ),

    path(
        "individual/my-donations/",
        MyIndividualDonationsView.as_view()
    ),

    path(
    "individual/dashboard/",
    IndividualDashboardView.as_view()
),
]