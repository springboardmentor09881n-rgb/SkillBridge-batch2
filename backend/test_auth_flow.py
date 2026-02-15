
from fastapi.testclient import TestClient
from main import app
import random
import string
import sys
import asyncio

# Try importing httpx
try:
    import httpx
except ImportError:
    print("httpx missing")
    sys.exit(1)

def random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_auth_flow():
    print("Starting Auth Flow Test...")
    email = f"{random_string()}@example.com"
    password = "password123"
    username = random_string()
    
    # Use context manager for TestClient
    with TestClient(app) as client:
        # Register
        reg_payload = {
            "username": username,
            "email": email,
            "password": password,
            "role": "Volunteer" 
        }
        
        print(f"Registering user: {email}")
        try:
            response = client.post("/api/user/register", json=reg_payload)
        except Exception as e:
            print(f"Request failed: {e}")
            return

        if response.status_code != 200:
            print(f"Register failed: {response.text}")
            return

        print("Registration successful.")
        
        # Login
        login_payload = {
            "email": email,
            "password": password
        }
        
        print("Logging in...")
        response = client.post("/api/user/login", json=login_payload)
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
        
        data = response.json()
        if "access_token" in data:
            print("Login successful! Token received.")
            print(f"Token: {data['access_token'][:20]}...")
        else:
            print("Login successful but NO TOKEN found in response.")
            print(f"Response data: {data}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    test_auth_flow()
