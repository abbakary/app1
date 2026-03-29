import http.client
import json
import uuid

HOST = "localhost"
PORT = 8000

def make_request(method, path, body=None, headers=None):
    conn = http.client.HTTPConnection(HOST, PORT)
    default_headers = {"Content-Type": "application/json"}
    if headers:
        default_headers.update(headers)
    
    conn.request(method, path, body=json.dumps(body) if body else None, headers=default_headers)
    res = conn.getresponse()
    data = res.read().decode()
    conn.close()
    
    if res.status >= 200 and res.status < 300:
        return json.loads(data) if data else True
    else:
        # print(f"ERROR: {res.status} {res.reason} - {data}")
        return res.status, data

def test_pending_approval_route():
    print("Testing /api/orders/pending-approval route...")
    
    # Get a valid restaurant ID
    restaurants = make_request("GET", "/api/restaurants")
    if not (isinstance(restaurants, list) and len(restaurants) > 0):
        print("No restaurants found to test with.")
        return
    
    rest_id = restaurants[0]['id']
    print(f"Using restaurant ID: {rest_id}")
    
    # Try to hit the pending-approval endpoint
    result = make_request("GET", "/api/orders/pending-approval", headers={"X-Restaurant-ID": rest_id})
    
    if isinstance(result, list):
        print(f"SUCCESS: Received {len(result)} pending orders.")
    elif isinstance(result, tuple):
        status, data = result
        print(f"FAILED: Status {status}, Data: {data}")
    else:
        print(f"FAILED: Unexpected result type: {type(result)}")

def test_portal_lookup():
    print("\nTesting portal lookup for existing restaurants...")
    restaurants = make_request("GET", "/api/restaurants")
    if not (isinstance(restaurants, list) and len(restaurants) > 0):
        return

    for r in restaurants:
        slug = r.get('customer_portal_url')
        if slug:
            print(f"Checking portal config for slug: {slug}")
            res = make_request("GET", f"/api/restaurants/portal/{slug}")
            if isinstance(res, dict):
                print(f"SUCCESS: Found portal config for {res.get('name')}")
            else:
                print(f"FAILED for slug {slug}")

if __name__ == "__main__":
    test_pending_approval_route()
    test_portal_lookup()
