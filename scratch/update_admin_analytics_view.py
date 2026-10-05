import os

filepath = 'backend/inventory/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''class AdminAnalyticsView(APIView):

    permission_classes = [IsAuthenticated, IsAdminRole]

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

        return Response(data)'''

replacement = '''class AdminAnalyticsView(APIView):

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):

        category_counts = {
            cat[0]: Inventory.objects.filter(category=cat[0]).count()
            for cat in Inventory.CATEGORY_CHOICES
        }

        all_statuses = [
            "Available",
            "Donated",
            "Accepted",
            "Scheduled",
            "Out For Pickup",
            "Delivered",
            "Completed",
            "Expired"
        ]
        status_counts = {
            st: Inventory.objects.filter(status=st).count()
            for st in all_statuses
        }

        data = {
            "businesses": User.objects.filter(role="BUSINESS").count(),
            "ngos": User.objects.filter(role="NGO").count(),
            "delivery": User.objects.filter(role="DELIVERY").count(),
            "individual_donors": User.objects.filter(role="INDIVIDUAL").count(),
            "products": Inventory.objects.count(),
            "accepted": Inventory.objects.filter(status="Accepted").count(),
            "scheduled": Inventory.objects.filter(status="Scheduled").count(),
            "delivered": Inventory.objects.filter(status="Delivered").count(),
            "completed": Inventory.objects.filter(status="Completed").count(),
            "available": Inventory.objects.filter(status="Available").count(),
            "donated": Inventory.objects.filter(status="Donated").count(),
            "out_for_pickup": Inventory.objects.filter(status="Out For Pickup").count(),
            "expired": Inventory.objects.filter(status="Expired").count(),
            "pending": Inventory.objects.exclude(
                status__in=["Delivered", "Completed"]
            ).count(),
            "category_distribution": category_counts,
            "status_distribution": status_counts,
        }

        return Response(data)'''

if target not in content:
    print('Target block not found!')
    exit(1)

new_content = content.replace(target, replacement, 1)
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
    f.flush()
    os.fsync(f.fileno())

print('Successfully updated AdminAnalyticsView in backend/inventory/views.py')

