import requests
import json

BASE_URL = "http://localhost:8000"

def test_create_delivery_order():
    # This requires a valid restaurant_id. Let's assume 'd663b23a-09d4-45de-9cf5-8810196fdc13' from seed.
    restaurant_id = 'd663b23a-09d4-45de-9cf5-8810196fdc13'
    
    order_data = {
        "status": "pending",
        "subtotal": 20.0,
        "tax": 2.0,
        "total": 22.0,
        "items": [],
        "order_type": "delivery",
        "delivery_address": "123 Test St",
        "customer_phone": "1234567890"
    }
    
    headers = {
        "X-Restaurant-ID": restaurant_id,
        "Content-Type": "application/json"
    }
    
    print(f"Sending POST request to {BASE_URL}/api/orders...")
    try:
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Order created successfully!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_create_delivery_order()
