from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User

        fields = [
            "owner_name",
            "business_name",
            "business_type",
            "username",
            "email",
            "password",
            "phone",
            "role",
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            phone=validated_data.get("phone"),
            role=validated_data["role"],
            owner_name=validated_data.get("owner_name"),
            business_name=validated_data.get("business_name"),
            business_type=validated_data.get("business_type"),
        )

        return user

class DeliveryProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "username",
            "phone",
            "vehicle_type",
            "vehicle_number",
            "availability",
        ]