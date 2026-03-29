from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from portal_utils import get_restaurant_by_portal_url
import models, schemas
import uuid

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=schemas.AuthToken)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or user.hashed_password != request.password:  # Simplified hash check
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": f"fake-jwt-{user.id}", "token_type": "bearer", "user_id": user.id, "role": user.role, "restaurant_id": user.restaurant_id}

@router.post("/pin", response_model=schemas.AuthToken)
def pin_login(request: schemas.PinLoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.pin == request.pin).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    return {"access_token": f"fake-jwt-{user.id}", "token_type": "bearer", "user_id": user.id, "role": user.role, "restaurant_id": user.restaurant_id}

@router.post("/customer/register", response_model=schemas.CustomerAuthToken)
def customer_register(
    request: schemas.CustomerRegisterRequest,
    x_restaurant_id: str = Header(...),
    db: Session = Depends(get_db)
):
    # Verify restaurant exists
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == x_restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Check if username already exists in this restaurant
    existing_user = db.query(models.User).filter(
        models.User.username == request.username,
        models.User.restaurant_id == x_restaurant_id,
        models.User.role == "customer"
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create new customer user
    user_id = str(uuid.uuid4())
    new_user = models.User(
        id=user_id,
        restaurant_id=x_restaurant_id,
        username=request.username,
        role="customer",
        phone=request.phone,
        hashed_password=request.password  # Simplified - should be hashed in production
    )
    db.add(new_user)
    db.commit()

    return {
        "access_token": f"fake-jwt-{user_id}",
        "token_type": "bearer",
        "user_id": user_id,
        "role": "customer",
        "restaurant_id": x_restaurant_id,
        "username": request.username
    }

@router.post("/customer/login", response_model=schemas.CustomerAuthToken)
def customer_login(
    request: schemas.CustomerLoginRequest,
    x_restaurant_id: str = Header(...),
    db: Session = Depends(get_db)
):
    # Verify restaurant exists
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == x_restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Find customer user
    user = db.query(models.User).filter(
        models.User.username == request.username,
        models.User.restaurant_id == x_restaurant_id,
        models.User.role == "customer"
    ).first()

    if not user or user.hashed_password != request.password:  # Simplified check
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "access_token": f"fake-jwt-{user.id}",
        "token_type": "bearer",
        "user_id": user.id,
        "role": "customer",
        "restaurant_id": x_restaurant_id,
        "name": user.name,
        "username": user.username
    }

# ===== Customer Portal Authentication (Portal URL based) =====

@router.post("/portal/{portal_url}/register", response_model=schemas.CustomerAuthToken)
def customer_portal_register(
    portal_url: str,
    request: schemas.CustomerRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Customer registration for a specific restaurant portal
    Uses portal URL instead of X-Restaurant-ID header
    """
    # Filter out common static file requests
    if portal_url.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.json', '.js', '.css')):
        raise HTTPException(status_code=404, detail="Not a valid portal URL")

    # Get restaurant by portal URL
    restaurant = get_restaurant_by_portal_url(portal_url, db)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Check if username already exists in this restaurant
    existing_user = db.query(models.User).filter(
        models.User.username == request.username,
        models.User.restaurant_id == restaurant.id,
        models.User.role == "customer"
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create new customer user
    user_id = str(uuid.uuid4())
    new_user = models.User(
        id=user_id,
        restaurant_id=restaurant.id,
        username=request.username,
        role="customer",
        phone=request.phone,
        hashed_password=request.password
    )
    db.add(new_user)
    db.commit()

    return {
        "access_token": f"fake-jwt-{user_id}",
        "token_type": "bearer",
        "user_id": user_id,
        "role": "customer",
        "restaurant_id": restaurant.id,
        "username": request.username
    }

@router.post("/portal/{portal_url}/login", response_model=schemas.CustomerAuthToken)
def customer_portal_login(
    portal_url: str,
    request: schemas.CustomerLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Customer login for a specific restaurant portal
    Uses portal URL instead of X-Restaurant-ID header
    """
    # Filter out common static file requests
    if portal_url.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.json', '.js', '.css')):
        raise HTTPException(status_code=404, detail="Not a valid portal URL")

    # Get restaurant by portal URL
    restaurant = get_restaurant_by_portal_url(portal_url, db)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Find customer user
    user = db.query(models.User).filter(
        models.User.username == request.username,
        models.User.restaurant_id == restaurant.id,
        models.User.role == "customer"
    ).first()

    if not user or user.hashed_password != request.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "access_token": f"fake-jwt-{user.id}",
        "token_type": "bearer",
        "user_id": user.id,
        "role": "customer",
        "restaurant_id": restaurant.id,
        "name": user.name,
        "username": user.username
    }
