import os, sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.conf import settings
if "testserver" not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append("testserver")

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
import json

User = get_user_model()
admin_user = User.objects.filter(role="ADMIN").first()
client = APIClient()
client.force_authenticate(user=admin_user)

resp = client.get("/api/inventory/admin/inventory/")
print("Status:", resp.status_code)
print("Count:", len(resp.data))

if len(resp.data) > 0:
    print("Keys in item:", list(resp.data[0].keys()))
    print("First item sample:", json.dumps(resp.data[0], indent=2, default=str))

# Check distinct statuses and categories in the database
from inventory.models import Inventory
statuses = list(Inventory.objects.values_list("status", flat=True).distinct())
categories = list(Inventory.objects.values_list("category", flat=True).distinct())
print("Distinct statuses in DB:", statuses)
print("Distinct categories in DB:", categories)
print("All STATUS_CHOICES on Model:", [c[0] for c in Inventory.STATUS_CHOICES])
print("All CATEGORY_CHOICES on Model:", [c[0] for c in Inventory.CATEGORY_CHOICES])

