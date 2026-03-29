import requests
import json

BASE_URL = "http://localhost:8000"
RESTAURANT_ID = 'd663b23a-09d4-45de-9cf5-8810196fdc13'  # From seed_db.py

def verify_customers():
    headers = {
        "X-Restaurant-ID": RESTAURANT_ID,
        "Content-Type": "application/json"
    }
    
    print(f"Fetching customers from {BASE_URL}/api/users?role=customer ...")
    try:
        response = requests.get(f"{BASE_URL}/api/users?role=customer", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            customers = response.json()
            print(f"Found {len(customers)} customers.")
            
            for customer in customers:
                print(f"Customer: {customer.get('name')} (@{customer.get('username')})")
                print(f"  - Email: {customer.get('email')}")
                print(f"  - Phone: {customer.get('phone')}")
                print(f"  - Role: {customer.get('role')}")
                print(f"  - Created At: {customer.get('created_at')}")
                
                if 'phone' in customer and customer['phone'] is not None:
                    print("  ✅ Phone field IS present and not None")
                elif 'phone' in customer:
                    print("  ⚠️ Phone field is present but IS None")
                else:
                    print("  ❌ Phone field is MISSING")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    verify_customers()
