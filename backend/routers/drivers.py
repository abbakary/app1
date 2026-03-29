from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
import uuid
from datetime import datetime

from database import get_db
from websocket_manager import manager
import models, schemas
from auth_utils import verify_restaurant

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])

@router.get("", response_model=List[schemas.Driver])
def get_drivers(db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    """Get all drivers for the restaurant"""
    return db.query(models.Driver)\
        .filter(models.Driver.restaurant_id == restaurant_id)\
        .order_by(models.Driver.created_at.desc())\
        .all()

@router.get("/available", response_model=List[schemas.Driver])
def get_available_drivers(db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    """Get all available drivers for the restaurant"""
    return db.query(models.Driver)\
        .filter(models.Driver.restaurant_id == restaurant_id)\
        .filter(models.Driver.is_available == True)\
        .all()

@router.get("/{driver_id}", response_model=schemas.Driver)
def get_driver(driver_id: str, db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    """Get a specific driver"""
    driver = db.query(models.Driver)\
        .filter(models.Driver.restaurant_id == restaurant_id)\
        .filter(models.Driver.id == driver_id)\
        .first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.post("", response_model=schemas.Driver)
async def create_driver(
    driver_data: schemas.DriverCreate,
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant)
):
    """Create a new driver"""
    db_driver = models.Driver(
        id=str(uuid.uuid4()),
        restaurant_id=restaurant_id,
        name=driver_data.name,
        phone=driver_data.phone,
        email=driver_data.email,
        vehicle_type=driver_data.vehicle_type,
        vehicle_plate=driver_data.vehicle_plate,
        rating=driver_data.rating,
        is_available=driver_data.is_available
    )
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

@router.patch("/{driver_id}", response_model=schemas.Driver)
async def update_driver(
    driver_id: str,
    driver_data: schemas.DriverUpdate,
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant)
):
    """Update a driver"""
    db_driver = db.query(models.Driver)\
        .filter(models.Driver.restaurant_id == restaurant_id)\
        .filter(models.Driver.id == driver_id)\
        .first()
    
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    update_data = driver_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_driver, field, value)
    
    db_driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_driver)
    return db_driver

@router.delete("/{driver_id}")
async def delete_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant)
):
    """Delete a driver"""
    db_driver = db.query(models.Driver)\
        .filter(models.Driver.restaurant_id == restaurant_id)\
        .filter(models.Driver.id == driver_id)\
        .first()
    
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Check if driver has active orders
    active_orders = db.query(models.Order)\
        .filter(models.Order.driver_id == driver_id)\
        .filter(models.Order.status != "paid")\
        .filter(models.Order.status != "cancelled")\
        .count()
    
    if active_orders > 0:
        raise HTTPException(status_code=400, detail="Cannot delete driver with active orders")
    
    db.delete(db_driver)
    db.commit()
    return {"detail": "Driver deleted successfully"}

@router.patch("/{driver_id}/location", response_model=schemas.Driver)
async def update_driver_location(
    driver_id: str,
    location_data: schemas.DriverLocationUpdate,
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant)
):
    """Update driver location (for real-time tracking)"""
    db_driver = db.query(models.Driver)\
        .filter(models.Driver.restaurant_id == restaurant_id)\
        .filter(models.Driver.id == driver_id)\
        .first()
    
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    db_driver.latitude = location_data.latitude
    db_driver.longitude = location_data.longitude
    db_driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_driver)
    
    # Broadcast driver location update to all clients
    await manager.broadcast_update({
        "type": "DRIVER_LOCATION_UPDATED",
        "driver_id": driver_id,
        "latitude": location_data.latitude,
        "longitude": location_data.longitude
    })
    
    return db_driver

@router.post("/{order_id}/assign-driver", response_model=schemas.Order)
async def assign_driver_to_order(
    order_id: str,
    assignment: schemas.DriverAssignRequest,
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant)
):
    """Assign a driver to a delivery order"""
    db_order = db.query(models.Order)\
        .filter(models.Order.restaurant_id == restaurant_id)\
        .filter(models.Order.id == order_id)\
        .first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.order_type not in ["delivery", "pickup"]:
        raise HTTPException(status_code=400, detail="Can only assign drivers to delivery/pickup orders")
    
    # Verify driver exists
    db_driver = db.query(models.Driver)\
        .filter(models.Driver.restaurant_id == restaurant_id)\
        .filter(models.Driver.id == assignment.driver_id)\
        .first()
    
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    db_order.driver_id = assignment.driver_id
    db_order.assigned_at = datetime.utcnow()
    db_order.updated_at = datetime.utcnow()
    db.commit()
    
    # Refresh with relationships
    refreshed_order = db.query(models.Order)\
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.menu_item),
                 joinedload(models.Order.driver))\
        .filter(models.Order.id == order_id)\
        .first()
    
    # Broadcast driver assignment
    await manager.broadcast_update({
        "type": "DRIVER_ASSIGNED",
        "order_id": order_id,
        "driver_id": assignment.driver_id
    })
    
    return refreshed_order
