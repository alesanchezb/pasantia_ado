import requests
import sys

BASE_URL = "http://localhost:8000/api/auth"

def test_register_login():
    s = requests.Session()
    
    # 1. Get CSRF
    print("1. Getting CSRF...")
    r = s.get(f"{BASE_URL}/csrf/")
    if r.status_code != 200:
        print(f"FAILED to get CSRF: {r.status_code} {r.text}")
        return False
    
    csrftoken = s.cookies.get("csrftoken")
    headers = {"X-CSRFToken": csrftoken, "Content-Type": "application/json"}
    print(f"CSRF: {csrftoken}")

    # 2. Register
    username = "testuser_auto_1"
    password = "password123"
    print(f"2. Registering {username}...")
    
    data = {"username": username, "password": password}
    r = s.post(f"{BASE_URL}/register/", json=data, headers=headers)
    
    # If user exists, that's fine for this test script, we proceed to login
    if r.status_code == 400 and "ya existe" in r.text:
        print("User already exists, proceeding to login...")
    elif r.status_code != 200:
        print(f"FAILED to register: {r.status_code} {r.text}")
        return False
    else:
        print("Registration OK")

    # 3. Login
    print("3. Logging in (Resetting session)...")
    s = requests.Session() # New session to simulate fresh login
    
    # Get CSRF again
    r = s.get(f"{BASE_URL}/csrf/")
    if r.status_code != 200:
        print(f"FAILED to get CSRF 2: {r.status_code}")
        return False
        
    csrftoken = s.cookies.get("csrftoken")
    headers = {"X-CSRFToken": csrftoken, "Content-Type": "application/json"}
    
    r = s.post(f"{BASE_URL}/login/", json=data, headers=headers)
    if r.status_code != 200:
        print(f"FAILED to login: {r.status_code} {r.text}")
        return False
    
    print("Login OK")
    return True

if __name__ == "__main__":
    if test_register_login():
        print("SUCCESS")
        sys.exit(0)
    else:
        print("FAILURE")
        sys.exit(1)
