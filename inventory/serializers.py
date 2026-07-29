from rest_framework import serializers
from .models import Inventory, Notification


class InventorySerializer(serializers.ModelSerializer):

    business_name = serializers.CharField(
        source="owner.business_name",
        read_only=True
    )

    class Meta:
        model = Inventory
        fields = "__all__"

        extra_kwargs = {
            "owner": {
                "read_only": True
            }
        }

class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "is_read",
            "created_at",
        ]

class IndividualDonationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Inventory
        fields = [
            "product_name",
            "category",
            "quantity",
            "unit",
            "expiry_date",
            "storage_type",
            "pickup_address",
            "contact_number",
            "description",
        ]