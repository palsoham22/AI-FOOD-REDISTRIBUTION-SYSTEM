from django.db import models
from accounts.models import User

class Inventory(models.Model):

    CATEGORY_CHOICES = [
        ("Dairy", "Dairy"),
        ("Fruits", "Fruits"),
        ("Vegetables", "Vegetables"),
        ("Bakery", "Bakery"),
        ("Beverages", "Beverages"),
        ("Others", "Others"),
    ]

    UNIT_CHOICES = [
        ("Kg", "Kg"),
        ("Litre", "Litre"),
        ("Packet", "Packet"),
        ("Piece", "Piece"),
    ]

    STORAGE_CHOICES = [
        ("Room Temperature", "Room Temperature"),
        ("Refrigerated", "Refrigerated"),
        ("Frozen", "Frozen"),
    ]

    STATUS_CHOICES = [

    ("Available","Available"),

    ("Donated","Donated"),

    ("Accepted","Accepted"),

    ("Scheduled", "Scheduled"),

    ("Out For Pickup","Out For Pickup"),
    
    ("Delivered","Delivered"),

    ("Expired","Expired"),

    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="inventory"
    )

    DONOR_TYPE_CHOICES = [
        ("BUSINESS", "Business"),
        ("INDIVIDUAL", "Individual"),
    ]

    donor_type = models.CharField(
        max_length=20,
        choices=DONOR_TYPE_CHOICES,
        default="BUSINESS"
    )

    product_name = models.CharField(max_length=100)

    barcode = models.CharField(
    max_length=50,
    blank=True,
    default=""
    )

    brand = models.CharField(
    max_length=100,
    blank=True,
    default=""
    )

    image_url = models.URLField(
    blank=True,
    default=""
    )

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES
    )

    quantity = models.IntegerField()

    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES
    )

    expiry_date = models.DateField()

    storage_type = models.CharField(
        max_length=30,
        choices=STORAGE_CHOICES
    )

    pickup_address = models.TextField(
        blank=True,
        default=""
    )

    contact_number = models.CharField(
        max_length=15,
        blank=True,
        default=""
    )

    description = models.TextField(
        blank=True,
        default=""
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Available"
    )

    pickup_date = models.DateField(
        null=True,
        blank=True
    )

    pickup_time = models.TimeField(
        null=True,
        blank=True
    )

    recommended_vehicle = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    pickup_otp = models.CharField(
        max_length=6,
        blank=True,
        default=""
    )

    delivery_otp = models.CharField(
        max_length=6,
        blank=True,
        default=""
    )

    pickup_verified = models.BooleanField(
        default=False
    )

    delivery_verified = models.BooleanField(
        default=False
    )


    vehicle_number = models.CharField(
        max_length=50,
        blank=True,
        default=""
    )

    current_latitude = models.FloatField(
        null=True,
        blank=True
    )

    current_longitude = models.FloatField(
        null=True,
        blank=True
    )

    volunteer_name = models.CharField(
        max_length=100,
        blank=True,
    default=""
    )

    assigned_driver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_pickups",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product_name

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("INFO", "Info"),
        ("SUCCESS", "Success"),
        ("WARNING", "Warning"),
        ("ERROR", "Error"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=150)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default="INFO"
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"