from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

from auth_utils import verify_restaurant

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("", response_model=schemas.AppStats)
def get_stats(db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    orders = db.query(models.Order).filter(models.Order.restaurant_id == restaurant_id).all()
    today_sales = sum(o.total for o in orders if o.status == "paid")
    completed_today = sum(1 for o in orders if o.status == "paid")
    # Only count approved orders for kitchen KPIs
    pending = sum(1 for o in orders if o.status == "pending" and o.approval_status == "approved")
    preparing = sum(1 for o in orders if o.status in ["preparing", "in-progress"] and o.approval_status == "approved")
    # New KPI for reception
    pending_approval = sum(1 for o in orders if o.approval_status == "pending")
    
    return {
        "todaySales": today_sales,
        "todayOrders": len(orders),
        "completedToday": completed_today,
        "pendingOrders": pending,
        "preparingOrders": preparing,
        "pendingApprovalOrders": pending_approval
    }
