from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        (
            "FoodBridge Details",
            {
                "fields": (
                    "role",
                    "phone",
                    "owner_name",
                    "business_name",
                    "business_type",
                    "availability",
                    "vehicle_type",
                    "vehicle_number",
                )
            },
        ),
    )

    list_display = (
        "username",
        "email",
        "role",
        "availability",
        "vehicle_type",
        "vehicle_number",
        "is_staff",
    )