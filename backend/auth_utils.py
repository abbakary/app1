from fastapi import Header, HTTPException

def verify_restaurant(x_restaurant_id: str = Header(None)):
    if not x_restaurant_id:
        raise HTTPException(status_code=400, detail="X-Restaurant-ID header is missing. Tenant context required.")
    return x_restaurant_id
