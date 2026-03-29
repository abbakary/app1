from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import uuid

router = APIRouter(prefix="/api/seed", tags=["Seed"])

@router.post("")
def seed_database(db: Session = Depends(get_db)):
    # Clear existing data for a clean seed
    db.query(models.Notification).delete()
    db.query(models.OrderItem).delete()
    db.query(models.Order).delete()
    db.query(models.MenuItem).delete()
    db.query(models.RestaurantTable).delete()
    db.query(models.User).delete()
    db.query(models.Restaurant).delete()
    db.commit()

    # Create SysAdmin
    sysadmin = models.User(
        id="5c230f7b-2390-4e5e-9e4f-ab408201ff71",
        name="Super Admin",
        email="sysadmin@platform.com",
        role="sysadmin",
        hashed_password="password",
        pin="9999"
    )
    db.add(sysadmin)

    # Create Default Restaurant
    restaurant_id = "d663b23a-09d4-45de-9cf5-8810196fdc13"
    rest = models.Restaurant(
        id=restaurant_id,
        name="Demo Restaurant",
        address="123 Example Street"
    )
    db.add(rest)
    
    # 1. Seed Users (attached to Demo Restaurant)
    users = [
        models.User(id="629fc2a5-979f-45ff-a2c2-d7312dfad44b", restaurant_id=restaurant_id, name="Admin User", email="admin@demo.com", role="admin", hashed_password="password", pin="1234"),
        models.User(id="ce63ccc5-db8b-4399-9e5c-fbb23a1ef3d5", restaurant_id=restaurant_id, name="Reception Desk", email="reception@demo.com", role="reception", hashed_password="password", pin="1111"),
        models.User(id="4bf7b2fe-f6ca-4e7b-8240-52d69d8afe77", restaurant_id=restaurant_id, name="Kitchen Display", email="kitchen@demo.com", role="kitchen", hashed_password="password", pin="2222"),
        models.User(id="customer-demo-001", restaurant_id=restaurant_id, name="John Customer", email="customer@demo.com", role="customer", hashed_password="password", phone="555-0123")
    ]
    db.add_all(users)
        
    # 2. Seed Restaurant Tables (attached to Demo Restaurant)
    tables = [
        models.RestaurantTable(id=str(uuid.uuid4()), restaurant_id=restaurant_id, name="Table 1", capacity=2, status="available", position_row=0, position_col=0, seats=2),
        models.RestaurantTable(id=str(uuid.uuid4()), restaurant_id=restaurant_id, name="Table 2", capacity=4, status="available", position_row=0, position_col=1, seats=4),
        models.RestaurantTable(id=str(uuid.uuid4()), restaurant_id=restaurant_id, name="Table 3", capacity=6, status="available", position_row=1, position_col=0, seats=6)
    ]
    db.add_all(tables)
        
    # 3. Seed Menu Items (attached to Demo Restaurant)
    menu_items = [
        models.MenuItem(id=str(uuid.uuid4()), restaurant_id=restaurant_id, name="Premium Burger", price=14.99, category="main", description="Angus beef patty with secret sauce", image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"),
        models.MenuItem(id=str(uuid.uuid4()), restaurant_id=restaurant_id, name="House Salad", price=8.99, category="appetizer", description="Fresh greens with balsamic", image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"),
        models.MenuItem(id=str(uuid.uuid4()), restaurant_id=restaurant_id, name="Truffle Fries", price=6.99, category="side", description="Crispy fries with truffle oil", image_url="https://images.unsplash.com/photo-1530016555861-110c8f411605?auto=format&fit=crop&q=80&w=800"),
        models.MenuItem(id=str(uuid.uuid4()), restaurant_id=restaurant_id, name="Craft Cola", price=3.99, category="beverage", description="Local craft cola", image_url="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800")
    ]
    db.add_all(menu_items)
        
    db.commit()
    return {"message": "Database seeded successfully with Users, Tables, and Menu Items"}
