from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
import models, schemas

from smart_menu_utils import classify_category, generate_tags, get_auto_image
from auth_utils import verify_restaurant

router = APIRouter(prefix="/api/menu", tags=["Menu"])

@router.get("", response_model=List[schemas.MenuItem])
def get_menu(db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    return db.query(models.MenuItem).filter(models.MenuItem.restaurant_id == restaurant_id).all()

@router.post("", response_model=schemas.MenuItem)
async def create_menu_item(item_in: schemas.MenuItemCreate, db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    # Smart logic: if category is not provided, classify it
    category = item_in.category or classify_category(item_in.name)
    
    # Smart logic: if image_url is not provided, get an auto image
    image_url = item_in.image_url or await get_auto_image(item_in.name, category)
    
    # Smart logic: generate tags
    tags = item_in.tags or generate_tags(item_in.name)
    
    db_item = models.MenuItem(
        id=str(uuid.uuid4()),
        restaurant_id=restaurant_id,
        name=item_in.name,
        price=item_in.price,
        category=category,
        description=item_in.description,
        available=item_in.available,
        image_url=image_url,
        tags=tags
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.patch("/{item_id}", response_model=schemas.MenuItem)
async def update_menu_item(item_id: str, updates: dict, db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    item = db.query(models.MenuItem).filter(models.MenuItem.restaurant_id == restaurant_id).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    if "name" in updates:
        item.name = updates["name"]
    if "price" in updates:
        item.price = updates["price"]
    if "category" in updates:
        item.category = updates["category"]
    if "description" in updates:
        item.description = updates["description"]
    if "available" in updates:
        item.available = updates["available"]
    if "image_url" in updates:
        item.image_url = updates["image_url"]
    if "tags" in updates:
        item.tags = updates["tags"]
        
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
async def delete_menu_item(item_id: str, db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    item = db.query(models.MenuItem).filter(models.MenuItem.restaurant_id == restaurant_id).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.delete(item)
    db.commit()
    return {"ok": True}
