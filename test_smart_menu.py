import requests
import json

BASE_URL = "http://localhost:8000"

def test_smart_menu():
    # We need a restaurant ID. Let's try to get one from the db or use the default one from seed_db
    # In this environment, jjqma is the default portal.
    restaurant_id = "jjqma" # This is actually the portal URL, but in some places it's used as ID or we need to find the real UUID.
    
    # Let's try to find a real restaurant ID by portal URL
    res = requests.get(f"{BASE_URL}/api/restaurants/portal/jjqma")
    if res.status_code == 200:
        restaurant_id = res.json()["id"]
    else:
        print(f"Could not find restaurant: {res.text}")
        return

    headers = {
        "X-Restaurant-ID": restaurant_id,
        "Content-Type": "application/json"
    }

    test_items = [
        {"name": "Espresso Coffee", "price": 5.0},
        {"name": "Fish and Chips", "price": 15.0},
        {"name": "Double Cheese Burger", "price": 12.0},
        {"name": "Chocolate Lava Cake", "price": 8.0},
        {"name": "Nyama Choma Grill", "price": 25.0}
    ]

    for item in test_items:
        print(f"Creating smart menu item: {item['name']}...")
        response = requests.post(f"{BASE_URL}/api/menu", headers=headers, data=json.dumps(item))
        if response.status_code == 200:
            data = response.json()
            print(f"  Success! Category: {data['category']}, Tags: {data['tags']}")
        else:
            print(f"  Failed: {response.text}")

if __name__ == "__main__":
    test_smart_menu()
