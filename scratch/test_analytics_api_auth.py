import os, sys
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS = list(settings.ALLOWED_HOSTS) + ['testserver']

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
client = APIClient()

print("--- Testing API Authorization on GET /api/inventory/admin/analytics/ ---")

# 1. Unauthenticated
resp = client.get('/api/inventory/admin/analytics/')
print(f"1. Unauthenticated: status_code={resp.status_code} (Expected 401)")
assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

# Helper to test roles
roles = ['BUSINESS', 'NGO', 'DELIVERY', 'INDIVIDUAL', 'ADMIN']
for role in roles:
    user = User.objects.filter(role=role).first()
    if not user:
        print(f"Warning: No user found for role {role}")
        continue
    client.force_authenticate(user=user)
    resp = client.get('/api/inventory/admin/analytics/')
    expected = 200 if role == 'ADMIN' else 403
    print(f"Role {role} (user={user.username}): status_code={resp.status_code} (Expected {expected})")
    assert resp.status_code == expected, f"For {role}, expected {expected}, got {resp.status_code}"
    if role == 'ADMIN':
        print(f"Admin response keys: {list(resp.data.keys())}")
        print(f"Total products: {resp.data.get('products')}")
        print(f"Category distribution: {resp.data.get('category_distribution')}")
        print(f"Status distribution: {resp.data.get('status_distribution')}")

print("ALL API AUTHORIZATION TESTS PASSED SUCCESSFULLY!")
