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

User = get_user_model()

roles_to_test = [
    ("Unauthenticated", None, 401),
    ("BUSINESS", User.objects.filter(role="BUSINESS").first(), 403),
    ("NGO", User.objects.filter(role="NGO").first(), 403),
    ("DELIVERY", User.objects.filter(role="DELIVERY").first(), 403),
    ("INDIVIDUAL", User.objects.filter(role="INDIVIDUAL").first(), 403),
    ("ADMIN", User.objects.filter(role="ADMIN").first(), 200),
]

all_passed = True
print("--- TESTING GET /api/inventory/admin/inventory/ ---")
for role_name, user_obj, expected_status in roles_to_test:
    client = APIClient()
    if user_obj:
        client.force_authenticate(user=user_obj)
    resp = client.get("/api/inventory/admin/inventory/")
    passed = (resp.status_code == expected_status)
    if not passed:
        all_passed = False
    print(f"Role: {role_name:<16} | Status: {resp.status_code} | Expected: {expected_status} | Result: {'PASS' if passed else 'FAIL'}")

if all_passed:
    print("\nALL AUTHORIZATION TESTS PASSED PERFECTLY!")
else:
    print("\nSOME TESTS FAILED!")
    sys.exit(1)

