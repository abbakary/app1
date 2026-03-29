from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

from auth_utils import verify_restaurant

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[schemas.Notification])
def get_notifications(db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    return db.query(models.Notification).filter(models.Notification.restaurant_id == restaurant_id).order_by(models.Notification.created_at.desc()).all()

@router.patch("/{notif_id}/read", response_model=schemas.Notification)
async def mark_notification_read(notif_id: str, db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    notif = db.query(models.Notification).filter(models.Notification.restaurant_id == restaurant_id).filter(models.Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif

