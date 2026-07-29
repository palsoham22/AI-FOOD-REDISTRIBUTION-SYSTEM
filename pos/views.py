from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from inventory.models import Inventory

class POSProductsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        products = [

            {
                "product_name": "Milk",
                "category": "Dairy",
                "quantity": 20,
                "unit": "Litre",
                "expiry_date": "2026-07-20",
                "storage_type": "Refrigerated"
            },

            {
                "product_name": "Bread",
                "category": "Bakery",
                "quantity": 15,
                "unit": "Packet",
                "expiry_date": "2026-07-14",
                "storage_type": "Room Temperature"
            },

            {
                "product_name": "Apple",
                "category": "Fruits",
                "quantity": 25,
                "unit": "Kg",
                "expiry_date": "2026-07-18",
                "storage_type": "Room Temperature"
            }

        ]

        return Response(products)

class ImportPOSProductsView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        sample_products = [

    {
        "product_name": "Milk",
        "category": "Dairy",
        "quantity": 15,
        "unit": "Litre",
        "expiry_date": "2026-07-12",
        "storage_type": "Refrigerated"
    },

    {
        "product_name": "Bread",
        "category": "Bakery",
        "quantity": 20,
        "unit": "Packet",
        "expiry_date": "2026-07-11",
        "storage_type": "Room Temperature"
    },

    {
        "product_name": "Yogurt",
        "category": "Dairy",
        "quantity": 10,
        "unit": "Packet",
        "expiry_date": "2026-07-13",
        "storage_type": "Refrigerated"
    }

]

        for product in sample_products:

            existing_product = Inventory.objects.filter(

                owner=request.user,
                product_name=product["product_name"],
                expiry_date=product["expiry_date"]

            ).first()

            if existing_product:

                existing_product.quantity += product["quantity"]

                existing_product.save()

            else:

                Inventory.objects.create(

                    owner=request.user,

                    product_name=product["product_name"],

                    category=product["category"],

                    quantity=product["quantity"],

                    unit=product["unit"],

                    expiry_date=product["expiry_date"],

                    storage_type=product["storage_type"],

                    status="Available"

                )

        return Response({

    "message": "POS Inventory Synced Successfully"

})