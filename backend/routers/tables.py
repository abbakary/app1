from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from websocket_manager import manager
import models, schemas

from auth_utils import verify_restaurant

import uuid

router = APIRouter(prefix="/api/tables", tags=["Tables"])

@router.get("", response_model=List[schemas.RestaurantTable])
def get_tables(db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    db_tables = db.query(models.RestaurantTable).filter(models.RestaurantTable.restaurant_id == restaurant_id).all()
    # Map model row/col to schema position object
    for table in db_tables:
        table.position = {"row": table.position_row, "col": table.position_col}
    return db_tables

@router.post("", response_model=schemas.RestaurantTable)
async def create_table(table_in: schemas.TableCreate, db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    db_table = models.RestaurantTable(
        id=str(uuid.uuid4()),
        restaurant_id=restaurant_id,
        name=table_in.name,
        capacity=table_in.capacity,
        status=table_in.status,
        position_row=table_in.position.row,
        position_col=table_in.position.col,
        seats=table_in.seats
    )
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    db_table.position = {"row": db_table.position_row, "col": db_table.position_col}
    await manager.broadcast_update({"type": "TABLE_UPDATED", "table_id": db_table.id})
    return db_table

@router.patch("/{table_id}", response_model=schemas.RestaurantTable)
async def update_table(table_id: str, updates: dict, db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.restaurant_id == restaurant_id).filter(models.RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    if "name" in updates:
        table.name = updates["name"]
    if "capacity" in updates:
        table.capacity = updates["capacity"]
    if "status" in updates:
        table.status = updates["status"]
    if "position" in updates:
        table.position_row = updates["position"]["row"]
        table.position_col = updates["position"]["col"]
    if "seats" in updates:
        table.seats = updates["seats"]
        
    db.commit()
    db.refresh(table)
    table.position = {"row": table.position_row, "col": table.position_col}
    await manager.broadcast_update({"type": "TABLE_UPDATED", "table_id": table.id})
    return table

@router.delete("/{table_id}")
async def delete_table(table_id: str, db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.restaurant_id == restaurant_id).filter(models.RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    db.delete(table)
    db.commit()
    await manager.broadcast_update({"type": "TABLE_DELETED", "table_id": table_id})
    return {"ok": True}
