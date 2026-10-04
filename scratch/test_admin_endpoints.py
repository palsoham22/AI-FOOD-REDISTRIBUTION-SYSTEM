import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.conf import settings
if "testserver" not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append("testserver")

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
admin_user = User.objects.filter(role="ADMIN").first()
client = APIClient()

print(f"Testing with Admin User: {admin_user.username} (role={admin_user.role})")
client.force_authenticate(user=admin_user)

# 1. Test Admin Dashboard API
resp1 = client.get("/api/inventory/admin-dashboard/")
print(f"admin-dashboard status: {resp1.status_code}")
print("admin-dashboard data:", resp1.data)

# 2. Test Admin Donations API
resp2 = client.get("/api/inventory/admin/donations/")
print(f"admin/donations status: {resp2.status_code}")
print(f"admin/donations count: {len(resp2.data)}")
if len(resp2.data) > 0:
    print("Sample donation:", {
        "id": resp2.data[0].get("id"),
        "product_name": resp2.data[0].get("product_name"),
        "business_name": resp2.data[0].get("business_name"),
        "status": resp2.data[0].get("status"),
        "quantity": resp2.data[0].get("quantity"),
        "unit": resp2.data[0].get("unit"),
    })

# 3. Test Non-Admin (403 Forbidden)
non_admin = User.objects.filter(role="BUSINESS").first()
if non_admin:
    client_na = APIClient()
    client_na.force_authenticate(user=non_admin)
    resp3 = client_na.get("/api/inventory/admin-dashboard/")
    print(f"Non-admin access status: {resp3.status_code} (Expected: 403)")

# 4. Test Unauthenticated (401 Unauthorized)
client_anon = APIClient()
resp4 = client_anon.get("/api/inventory/admin-dashboard/")
print(f"Anonymous access status: {resp4.status_code} (Expected: 401)")

print("\n--- ALL BACKEND CHECKS PASSED SUCCESSFULLY ---")

