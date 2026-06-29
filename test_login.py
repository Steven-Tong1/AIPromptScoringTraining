"""Test script to verify login and API access."""
import requests
import json

BASE = "http://localhost:8000/api/v1"

# Test login
print("=" * 50)
print("Testing login with admin/admin123...")
r = requests.post(
    f"{BASE}/auth/login",
    json={"username": "admin", "password": "admin123"},
)
print(f"Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    token = data["access_token"]
    print(f"Login OK! Token: {token[:50]}...")
    
    # Test prompts list
    print("\nTesting prompts list...")
    r2 = requests.get(
        f"{BASE}/prompts",
        params={"limit": 6},
        headers={"Authorization": f"Bearer {token}"},
    )
    print(f"Status: {r2.status_code}")
    if r2.status_code == 200:
        prompts = r2.json()
        print(f"Got {len(prompts)} prompts")
    else:
        print(f"Error: {r2.text}")
    
    # Test me endpoint
    print("\nTesting /auth/me...")
    r3 = requests.get(
        f"{BASE}/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    print(f"Status: {r3.status_code}")
    if r3.status_code == 200:
        user = r3.json()
        print(f"User: {user}")
    else:
        print(f"Error: {r3.text}")
else:
    print(f"Error: {r.text}")
