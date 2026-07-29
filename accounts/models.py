from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ('BUSINESS', 'Business'),
        ('NGO', 'NGO'),
        ('DELIVERY', 'Delivery Partner'),
        ('ADMIN', 'Admin'),
        ("INDIVIDUAL", "Individual Donor"),
    )

    BUSINESS_TYPES = (
        ('Restaurant', 'Restaurant'),
        ('Supermarket', 'Supermarket'),
        ('Bakery', 'Bakery'),
        ('Cafe', 'Cafe'),
        ('Hotel', 'Hotel'),
        ('Cloud Kitchen', 'Cloud Kitchen'),
    )

    AVAILABILITY_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('BUSY', 'Busy'),
        ('OFFLINE', 'Offline'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='BUSINESS'
    )

    availability = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default='AVAILABLE'
    )

    vehicle_type = models.CharField(
        max_length=50,
        blank=True,
        default=""
    )

    vehicle_number = models.CharField(
        max_length=30,
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

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    # NEW FIELDS
    owner_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    business_name = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    business_type = models.CharField(
        max_length=30,
        choices=BUSINESS_TYPES,
        blank=True,
        null=True
    )

    def __str__(self):
        return self.username