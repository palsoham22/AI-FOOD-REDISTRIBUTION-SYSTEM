from rest_framework import generics

import inventory
from .models import Inventory, Notification
from .serializers import InventorySerializer, NotificationSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
import random
from rest_framework import status
from accounts.models import User
import csv
import io
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
import requests
from .utils import create_notification
from .serializers import IndividualDonationSerializer

class InventoryCreateView(generics.CreateAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Inventory.objects.all()

    serializer_class = InventorySerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class InventoryListView(generics.ListAPIView):

    permission_classes = [IsAuthenticated]

    serializer_class = InventorySerializer

    def get_queryset(self):
        return Inventory.objects.filter(owner=self.request.user)

class InventoryDeleteView(generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    serializer_class = InventorySerializer

    def get_queryset(self):
        return Inventory.objects.filter(owner=self.request.user)

class InventoryUpdateView(generics.UpdateAPIView):

    permission_classes = [IsAuthenticated]

    serializer_class = InventorySerializer

    def get_queryset(self):
        return Inventory.objects.filter(owner=self.request.user)
    

class DonateProductView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:

            product = Inventory.objects.get(
                id=pk,
                owner=request.user
            )

            product.status = "Donated"
            product.save()

            return Response(
                {"message": "Product Donated Successfully"}
            )

        except Inventory.DoesNotExist:

            return Response(
                {"error": "Product Not Found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
class AcceptDonationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:

            product = Inventory.objects.get(
                id=pk,
                status="Donated"
            )

            product.status = "Accepted"

            product.save()

            create_notification(
                user=product.owner,
                title="Donation Accepted",
                message=f"{request.user.business_name} has accepted your donation.",
                notification_type="SUCCESS"
            )

            return Response(
                {"message":"Donation Accepted"}
            )

        except Inventory.DoesNotExist:

            return Response(
                {"error":"Product Not Found"},
                status=404
            )

class DonationListView(generics.ListAPIView):

    permission_classes = [IsAuthenticated]

    serializer_class = InventorySerializer

    def get_queryset(self):

        return Inventory.objects.filter(
            status="Donated"
        )

class AcceptedDonationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        donations = Inventory.objects.filter(
            status="Accepted"
        )

        serializer = InventorySerializer(
            donations,
            many=True
        )

        return Response(serializer.data)

class AdminDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = {

    "total_users": User.objects.count(),

    "businesses": User.objects.filter(role="BUSINESS").count(),

    "ngos": User.objects.filter(role="NGO").count(),

    "delivery_partners": User.objects.filter(role="DELIVERY").count(),

    "products": Inventory.objects.count(),

    "donated": Inventory.objects.filter(status="Donated").count(),

    "accepted": Inventory.objects.filter(status="Accepted").count(),

    "scheduled": Inventory.objects.filter(status="Scheduled").count(),

    "delivered": Inventory.objects.filter(status="Delivered").count(),

}

        return Response(data)
    
class CSVUploadView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if "file" not in request.FILES:
            return Response(
                {"error": "No file uploaded"},
                status=400
            )

        file = request.FILES["file"]

        data = file.read().decode("utf-8-sig")
        csv_file = io.StringIO(data)
        reader = csv.DictReader(csv_file)

        print("HEADERS:", reader.fieldnames)

        for row in reader:

            expiry = row["expiry_date"].strip()

            try:
                expiry = datetime.strptime(expiry, "%d-%m-%Y").date()
            except:
                expiry = datetime.strptime(expiry, "%Y-%m-%d").date()

            Inventory.objects.create(
                owner=request.user,
                product_name=row["product_name"].strip(),
                category=row["category"].strip(),
                quantity=int(row["quantity"]),
                unit=row["unit"].strip(),
                expiry_date=expiry,
                storage_type=row["storage_type"].strip(),
                status="Available"
            )

        return Response(
            {
                "message": "CSV uploaded successfully"
            },
            status=200
        )
class SchedulePickupView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        try:

            inventory = Inventory.objects.get(id=id)

            # Vehicle Recommendation

            if inventory.storage_type == "Frozen":
                recommended_vehicle = "🧊 Freezer Truck"

            elif inventory.storage_type == "Refrigerated":
                recommended_vehicle = "❄️ Refrigerated Van"

            elif inventory.quantity <= 20:
                recommended_vehicle = "🛵 Bike"

            elif inventory.quantity <= 100:
                recommended_vehicle = "🛺 Auto"

            else:
                recommended_vehicle = "🚐 Mini Van"

            return Response({

                "product_name": inventory.product_name,
                "category": inventory.category,
                "quantity": inventory.quantity,
                "unit": inventory.unit,
                "storage_type": inventory.storage_type,
                "recommended_vehicle": recommended_vehicle

            })

        except Inventory.DoesNotExist:

            return Response(
                {"error": "Donation not found"},
                status=404
            )

    def post(self, request, id):

        try:

            inventory = Inventory.objects.get(id=id)

            inventory.pickup_date = request.data.get("pickup_date")
            inventory.pickup_time = request.data.get("pickup_time")

            volunteer_name = request.data.get("volunteer_name")
            inventory.volunteer_name = volunteer_name

            inventory.vehicle_number = request.data.get("vehicle_number")

            # Assign Delivery Partner
            try:
                driver = User.objects.get(
                    username=volunteer_name,
                    role="DELIVERY"
                )

                if driver.availability != "AVAILABLE":
                    return Response(
                    {
                        "error": "Selected delivery partner is not available."
                    },
                        status=400
                    )   

                inventory.assigned_driver = driver

                driver.availability = "BUSY"
                driver.save()

            except User.DoesNotExist:
                return Response(
                    {"error": "Selected delivery partner not found."},
                    status=404
                )

        # -----------------------------
        # Vehicle Recommendation Logic
        # -----------------------------

            if inventory.storage_type == "Frozen":
                inventory.recommended_vehicle = "🧊 Freezer Truck"

            elif inventory.storage_type == "Refrigerated":
                inventory.recommended_vehicle = "❄️ Refrigerated Van"

            elif inventory.quantity <= 20:
                inventory.recommended_vehicle = "🛵 Bike"

            elif inventory.quantity <= 100:
                inventory.recommended_vehicle = "🛺 Auto"

            else:
                inventory.recommended_vehicle = "🚐 Mini Van"

        # Generate OTPs
            inventory.pickup_otp = str(random.randint(100000, 999999))
            inventory.delivery_otp = str(random.randint(100000, 999999))

        # Reset verification status
            inventory.pickup_verified = False
            inventory.delivery_verified = False

            inventory.status = "Scheduled"

            inventory.save()

            create_notification(
                user=inventory.owner,
                title="Pickup Scheduled",
                message=f"Your donation '{inventory.product_name}' has been scheduled for pickup on {inventory.pickup_date} at {inventory.pickup_time}.",
                notification_type="INFO"
            )

            create_notification(
                user=driver,
                title="New Pickup Assigned",
                message=f"You have been assigned to pick up '{inventory.product_name}' on {inventory.pickup_date} at {inventory.pickup_time}.",
                notification_type="INFO"
            )

            create_notification(
                user=inventory.owner,
                title="Pickup OTP Generated",
                message=f"Your pickup OTP is {inventory.pickup_otp}. Share it with the delivery partner during pickup.",
                notification_type="INFO"
            )

            return Response({
                "message": "Pickup Scheduled Successfully",
                "pickup_otp": inventory.pickup_otp,
                "delivery_otp": inventory.delivery_otp
            })

        except Inventory.DoesNotExist:

            return Response(
                {"error": "Donation not found"},
                status=404
            )
    
class ConfirmPickupView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, id):

        try:

            inventory = Inventory.objects.get(id=id)

            inventory.status = "Completed"

            inventory.save()

            return Response(
                {"message": "Pickup Confirmed Successfully"}
            )

        except Inventory.DoesNotExist:

            return Response(
                {"error": "Donation Not Found"},
                status=404
            )
    
class ScheduledDonationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        donations = Inventory.objects.filter(
            status="Scheduled"
        )

        serializer = InventorySerializer(
            donations,
            many=True
        )

        return Response(serializer.data)
    
class DonationHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        deliveries = Inventory.objects.filter(
            status="Delivered"
        ).order_by("-created_at")

        serializer = InventorySerializer(
          deliveries,
          many=True
        )

        return Response(serializer.data)
    

class OutForPickupListView(generics.ListAPIView):

    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Inventory.objects.filter(status="Out For Pickup")
    
class MarkDeliveredView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, id):

        try:

            inventory = Inventory.objects.get(id=id)

            inventory.status = "Completed"

            inventory.save()

            return Response(
                {"message": "Delivery Completed Successfully"}
            )

        except Inventory.DoesNotExist:

            return Response(
                {"error": "Donation Not Found"},
                status=404
            )
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_pickup(request, id):

    inventory = Inventory.objects.get(id=id)

    inventory.status = "Out For Pickup"

    inventory.save()

    return Response({"message": "Pickup Started"})


class BarcodeLookupView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, barcode):

        url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"

        try:

            headers = {
                   "User-Agent": "FoodBridgeAI/1.0 (student-project; contact: demo@example.com)"
            }

            response = requests.get(
            url,
            headers=headers,
            timeout=10
          )

            print("STATUS:", response.status_code)
            print("CONTENT TYPE:", response.headers.get("Content-Type"))
            print("TEXT:", response.text[:500])   # First 500 characters

            data = response.json()

            if data.get("status") != 1:

                return Response(
                    {
                        "success": False,
                        "message": "Product not found"
                    },
                    status=404
                )

            product = data.get("product", {})

            categories = product.get("categories", "").lower()

            if "milk" in categories or "dairy" in categories:
                category = "Dairy"

            elif "bread" in categories or "bakery" in categories:
                category = "Bakery"

            elif "fruit" in categories:
                category = "Fruits"

            elif "vegetable" in categories:
                category = "Vegetables"

            else:
                category = "Other"

            return Response({

                "success": True,

                "barcode": barcode,

                "product_name": product.get("product_name", ""),

                "brand": product.get("brands", ""),

                "category": category,

                "image": product.get("image_front_url", "")

            })

        except Exception as e:

            return Response(

                {

                    "success": False,

                    "error": str(e)

                },

                status=500

            )

class MyAssignedPickupsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        pickups = Inventory.objects.filter(
            assigned_driver=request.user
        ).order_by("-created_at")

        data = []

        for pickup in pickups:

            data.append({
                "id": pickup.id,
                "product_name": pickup.product_name,
                "category": pickup.category,
                "quantity": pickup.quantity,
                "pickup_date": pickup.pickup_date,
                "pickup_time": pickup.pickup_time,
                "status": pickup.status,
                "vehicle_number": pickup.vehicle_number,
                "recommended_vehicle": pickup.recommended_vehicle,

                # NEW FIELDS
                "pickup_verified": pickup.pickup_verified,
                "delivery_verified": pickup.delivery_verified,
            })

        return Response(data)

class VerifyPickupOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):

        try:
            inventory = Inventory.objects.get(id=id)

            if inventory.pickup_verified:
                return Response(
                {
                    "message": "Pickup OTP has already been verified."
                }
                )

            entered_otp = request.data.get("pickup_otp")

            if entered_otp == inventory.pickup_otp:

                inventory.pickup_verified = True
                inventory.status = "Out For Pickup"
                inventory.save()

                create_notification(
                    user=inventory.owner,
                    title="Pickup Completed",
                    message=f"Your donation '{inventory.product_name}' has been successfully picked up.",
                    notification_type="SUCCESS"
                )

                create_notification(
                    user=inventory.accepted_by,
                    title="Pickup Completed",
                    message=f"The pickup for '{inventory.product_name}' has been completed successfully.",
                    notification_type="SUCCESS"
                )

                create_notification(
                    user=inventory.accepted_by,
                    title="Delivery OTP Generated",
                    message=f"Delivery OTP for '{inventory.product_name}' is {inventory.delivery_otp}.",
                    notification_type="INFO"
            )

                return Response({
                    "message": "Pickup OTP Verified Successfully"
                })

            return Response(
                {"error": "Invalid Pickup OTP"},
                status=400
            )

        except Inventory.DoesNotExist:
            return Response(
                {"error": "Pickup not found"},
                status=404
            )

class VerifyDeliveryOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):

        try:
            inventory = Inventory.objects.get(id=id)

            if inventory.delivery_verified:
                return Response(
                {
                    "message": "Delivery OTP has already been verified."
                }
            )

            if not inventory.pickup_verified:
                return Response(
                {
                    "error": "Pickup OTP must be verified before Delivery OTP."
                },
                    status=400
                )

            entered_otp = request.data.get("delivery_otp")

            if entered_otp == inventory.delivery_otp:

                inventory.delivery_verified = True
                inventory.status = "Delivered"

                # Make driver available again
                if inventory.assigned_driver:
                    inventory.assigned_driver.availability = "AVAILABLE"
                    inventory.assigned_driver.save()

                inventory.save()

                # Notify Business
                create_notification(
                    user=inventory.owner,
                    title="Donation Delivered",
                    message=f"Your donation '{inventory.product_name}' has been successfully delivered.",
                    notification_type="SUCCESS"
                )

                # Notify NGO
                create_notification(
                    user=inventory.accepted_by,
                    title="Donation Delivered",
                    message=f"The donation '{inventory.product_name}' has been delivered successfully.",
                    notification_type="SUCCESS"
                )

                # Notify Delivery Partner
                create_notification(
                    user=request.user,
                    title="Delivery Completed",
                    message=f"You have successfully completed the delivery of '{inventory.product_name}'.",
                    notification_type="SUCCESS"
                )

                return Response({
                    "message": "Delivery Completed Successfully"
                })

            return Response(
                {"error": "Invalid Delivery OTP"},
                status=400
            )

        except Inventory.DoesNotExist:

            return Response(
                {"error": "Delivery not found"},
                status=404
            )


class NGODashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        available = Inventory.objects.filter(status="Donated").count()

        accepted = Inventory.objects.filter(status="Accepted").count()

        scheduled = Inventory.objects.filter(status="Scheduled").count()

        delivered = Inventory.objects.filter(status="Delivered").count()

        return Response({

            "available": available,
            "accepted": accepted,
            "scheduled": scheduled,
            "delivered": delivered

        })

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            user=request.user
        ).order_by("-created_at")

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)

class MarkNotificationReadView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:

            notification = Notification.objects.get(
                id=pk,
                user=request.user
            )

            notification.is_read = True
            notification.save()

            return Response({
                "message": "Notification marked as read"
            })

        except Notification.DoesNotExist:

            return Response(
                {"error": "Notification not found"},
                status=404
            )

class AdminInventoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        inventories = Inventory.objects.all().order_by("-id")
        serializer = InventorySerializer(inventories, many=True)
        return Response(serializer.data)

class AdminDonationsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        donations = Inventory.objects.filter(
            status__in=[
                "Accepted",
                "Scheduled",
                "Out For Delivery",
                "Delivered"
            ]
        ).order_by("-id")

        serializer = InventorySerializer(donations, many=True)

        return Response(serializer.data)

class AdminAnalyticsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = {

            "businesses": User.objects.filter(role="BUSINESS").count(),

            "ngos": User.objects.filter(role="NGO").count(),

            "delivery": User.objects.filter(role="DELIVERY").count(),

            "products": Inventory.objects.count(),

            "accepted": Inventory.objects.filter(status="Accepted").count(),

            "scheduled": Inventory.objects.filter(status="Scheduled").count(),

            "delivered": Inventory.objects.filter(status="Delivered").count(),

            "pending": Inventory.objects.exclude(
                status="Delivered"
            ).count(),

        }

        return Response(data)

class AdminTransactionsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        transactions = Inventory.objects.all().order_by("-id")

        serializer = InventorySerializer(
            transactions,
            many=True
        )

        return Response(serializer.data)

class UserProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        data = {
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "phone": getattr(user, "phone", "")
        }

        return Response(data)


class ChangePasswordView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):

            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response({
            "message": "Password changed successfully"
        })

class IndividualDonationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = IndividualDonationSerializer(data=request.data)

        if serializer.is_valid():

            donation = serializer.save(
                owner=request.user,
                donor_type="INDIVIDUAL",
                status="Available"
            )

            return Response(
                {
                    "message": "Donation Submitted Successfully"
                },
                status=201
            )

        return Response(serializer.errors, status=400)

class MyIndividualDonationsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        donations = Inventory.objects.filter(
            owner=request.user,
            donor_type="INDIVIDUAL"
        ).order_by("-created_at")

        serializer = InventorySerializer(
            donations,
            many=True
        )

        return Response(serializer.data)

from django.db.models import Count

class IndividualDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        donations = Inventory.objects.filter(
            owner=request.user,
            donor_type="INDIVIDUAL"
        )

        data = {
            "total_donations": donations.count(),
            "pending": donations.filter(status="Available").count(),
            "accepted": donations.filter(status="Accepted").count(),
            "scheduled": donations.filter(status="Scheduled").count(),
            "delivered": donations.filter(status="Delivered").count(),
        }

        return Response(data)