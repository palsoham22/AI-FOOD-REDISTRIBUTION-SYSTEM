from rest_framework import generics
from .models import User
from .serializers import RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .jwt_serializer import MyTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import DeliveryProfileSerializer
from inventory.models import Inventory

class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class AvailableDeliveryPartnersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        partners = User.objects.filter(
            role="DELIVERY",
            availability="AVAILABLE"
        )

        data = []

        for partner in partners:

            for partner in partners:
                data.append({
                    "id": partner.id,
                    "username": partner.username,
                    "phone": partner.phone,
                    "availability": partner.availability,
                    "vehicle_type": partner.vehicle_type,
                    "vehicle_number": partner.vehicle_number,
                })

        return Response(data)

class DeliveryProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = DeliveryProfileSerializer(request.user)

        return Response(serializer.data)

class UpdateLocationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        request.user.current_latitude = latitude
        request.user.current_longitude = longitude
        request.user.save()

        return Response({
            "message": "Location updated successfully"
        })



class DeliveryDashboardStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        assigned = Inventory.objects.filter(
            assigned_driver=request.user
        ).count()

        out_for_pickup = Inventory.objects.filter(
            assigned_driver=request.user,
            status="Out For Pickup"
        ).count()

        completed = Inventory.objects.filter(
            assigned_driver=request.user,
            status="Delivered"
        ).count()

        return Response({
            "assigned": assigned,
            "out_for_pickup": out_for_pickup,
            "completed": completed,
        })

class DriverLocationView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, driver_id):

        try:

            driver = User.objects.get(
                id=driver_id,
                role="DELIVERY"
            )

            return Response({

                "latitude": driver.current_latitude,
                "longitude": driver.current_longitude,
                "username": driver.username,
                "availability": driver.availability

            })

        except User.DoesNotExist:

            return Response(
                {"error": "Driver not found"},
                status=404
            )