from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from database import get_db
import models, schemas
from auth_utils import verify_restaurant

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=List[schemas.User])
def get_users(
    db: Session = Depends(get_db), 
    restaurant_id: str = Depends(verify_restaurant),
    role: Optional[str] = None
):
    query = db.query(models.User).filter(models.User.restaurant_id == restaurant_id)
    if role:
        query = query.filter(models.User.role == role)
    return query.all()

@router.post("", response_model=schemas.User)
def create_user(
    user_data: schemas.UserBase, 
    db: Session = Depends(get_db), 
    restaurant_id: str = Depends(verify_restaurant)
):
    # Check if user already exists (by email or username)
    if user_data.email:
        existing = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")
    
    if user_data.username:
        existing = db.query(models.User).filter(
            models.User.username == user_data.username,
            models.User.restaurant_id == restaurant_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken in this restaurant")

    db_user = models.User(
        id=str(uuid.uuid4()),
        restaurant_id=restaurant_id,
        name=user_data.name,
        email=user_data.email,
        username=user_data.username,
        role=user_data.role,
        pin=user_data.pin,
        phone=getattr(user_data, 'phone', None), # In case phone is in UserBase
        hashed_password="password" # Default password for now
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.patch("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: str, 
    updates: schemas.UserBase, 
    db: Session = Depends(get_db), 
    restaurant_id: str = Depends(verify_restaurant)
):
    db_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.restaurant_id == restaurant_id
    ).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if updates.name is not None: db_user.name = updates.name
    if updates.email is not None: db_user.email = updates.email
    if updates.username is not None: db_user.username = updates.username
    if updates.role is not None: db_user.role = updates.role
    if updates.pin is not None: db_user.pin = updates.pin
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(
    user_id: str, 
    db: Session = Depends(get_db), 
    restaurant_id: str = Depends(verify_restaurant)
):
    db_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.restaurant_id == restaurant_id
    ).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}
