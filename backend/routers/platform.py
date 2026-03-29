from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

from database import get_db
import models, schemas

router = APIRouter(prefix="/api/platform", tags=["Platform (SysAdmin)"])

@router.get("/users", response_model=List[schemas.User])
def get_all_users(db: Session = Depends(get_db)):
    """List all users across all tenants."""
    return db.query(models.User).all()

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    """Delete any user from the platform."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/stats", response_model=schemas.PlatformStats)
def get_platform_stats(db: Session = Depends(get_db)):
    """Aggregate stats across all tenants."""
    total_tenants = db.query(models.Restaurant).count()
    total_users = db.query(models.User).count()
    total_orders = db.query(models.Order).count()
    total_revenue = db.query(func.sum(models.Order.total)).scalar() or 0.0
    
    return {
        "total_tenants": total_tenants,
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": total_revenue
    }
