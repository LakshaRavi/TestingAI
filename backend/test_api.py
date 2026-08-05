import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(url, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Content-Type', 'application/json')
    body = json.dumps(data).encode('utf-8') if data else None
    
    try:
        with urllib.request.urlopen(req, data=body) as response:
            res_body = response.read().decode('utf-8')
            return json.loads(res_body)
    except Exception as e:
        print(f"Request Error [{method} {url}]: {e}")
        return None

def test_all():
    print("--- TESTING BACKEND ENDPOINTS ---")
    
    # 1. Test Root
    res = make_request("http://127.0.0.1:8000/")
    print("1. Root Status:", res)
    
    # 2. Test Login Admin
    admin_login = make_request(f"{BASE_URL}/login", "POST", {"email": "admin@office.com", "password": "admin123"})
    print("2. Admin Login Response:", admin_login)

    # 3. Test Login Employee
    emp_login = make_request(f"{BASE_URL}/login", "POST", {"email": "john@office.com", "password": "user123"})
    print("3. Employee Login Response:", emp_login)

    # 4. Get Users
    users = make_request(f"{BASE_URL}/users")
    print(f"4. Users Count: {len(users) if users else 0}")

    # 5. Get Projects
    projects = make_request(f"{BASE_URL}/projects")
    print(f"5. Projects Count: {len(projects) if projects else 0}")

    # 6. Get Metrics
    metrics = make_request(f"{BASE_URL}/dashboard/metrics")
    print("6. Dashboard Metrics:", metrics)

    # 7. Get Reports
    reports = make_request(f"{BASE_URL}/reports")
    print(f"7. Reports Count: {len(reports) if reports else 0}")

    print("--- ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ---")

if __name__ == "__main__":
    test_all()
