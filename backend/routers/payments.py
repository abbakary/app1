from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from database import get_db
from websocket_manager import manager
from airpay_client import airpay_client
import models, schemas

from auth_utils import verify_restaurant

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.get("", response_model=List[schemas.Payment])
def get_payments(db: Session = Depends(get_db), restaurant_id: str = Depends(verify_restaurant)):
    return db.query(models.Payment).filter(models.Payment.restaurant_id == restaurant_id).order_by(models.Payment.created_at.desc()).all()

@router.post("", response_model=schemas.Payment)
async def initiate_payment(
    payment_request: schemas.PaymentInitiateRequest,
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant)
):
    """
    Initiate a payment via Airpay with split logic:
    - Platform receives platform_fee_percentage (default 10%)
    - Restaurant receives remaining amount
    """

    # Get restaurant
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Check if restaurant has Airpay account
    if not restaurant.airpay_account_id:
        raise HTTPException(
            status_code=400,
            detail="Restaurant Airpay account not configured. Please contact support."
        )

    if restaurant.payment_status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Restaurant payment status is {restaurant.payment_status}. Cannot process payments."
        )

    # Get order
    order = db.query(models.Order).filter(
        models.Order.id == payment_request.order_id,
        models.Order.restaurant_id == restaurant_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Create payment record with PENDING status
    db_payment = models.Payment(
        id=str(uuid.uuid4()),
        restaurant_id=restaurant_id,
        order_id=payment_request.order_id,
        amount=payment_request.amount,
        method="airpay",
        status="PENDING"
    )

    # Calculate split
    platform_fee = payment_request.amount * (payment_request.platform_fee_percentage / 100)
    restaurant_amount = payment_request.amount - platform_fee

    db_payment.platform_fee = platform_fee
    db_payment.restaurant_amount = restaurant_amount

    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)

    # Initiate payment with Airpay (async)
    # This will return a payment URL that the customer needs to visit
    airpay_result = await airpay_client.initiate_payment(
        order_id=payment_request.order_id,
        amount=payment_request.amount,
        restaurant_account_id=restaurant.airpay_account_id,
        customer_phone=payment_request.customer_phone,
        customer_email=payment_request.customer_email,
        platform_fee_percentage=payment_request.platform_fee_percentage
    )

    if not airpay_result.get("success"):
        db_payment.status = "FAILED"
        db.commit()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to initiate payment: {airpay_result.get('error')}"
        )

    # Update payment with Airpay transaction ID
    db_payment.airpay_transaction_id = airpay_result.get("transaction_id")
    db.commit()
    db.refresh(db_payment)

    # Return payment with payment URL
    response = schemas.Payment.from_orm(db_payment)
    # Attach payment URL as a custom field
    response_dict = response.dict()
    response_dict["payment_url"] = airpay_result.get("payment_url")

    await manager.broadcast_update({
        "type": "PAYMENT_INITIATED",
        "order_id": payment_request.order_id,
        "payment_id": db_payment.id
    })

    return response_dict

@router.post("/webhook")
async def handle_airpay_webhook(
    data: dict,
    db: Session = Depends(get_db)
):
    """
    Handle incoming webhook from Airpay

    Webhook payload should include:
    - transaction_id: Airpay transaction ID
    - status: 'SUCCESS' or 'FAILED'
    - amount: Transaction amount
    - order_reference: Order ID

    Header: X-Airpay-Signature for signature verification
    """

    # For now, we'll trust the webhook (in production, verify signature)
    # signature = request.headers.get("X-Airpay-Signature", "")
    # if not airpay_client.verify_webhook_signature(json.dumps(data), signature):
    #     raise HTTPException(status_code=401, detail="Invalid signature")

    transaction_id = data.get("transaction_id")
    order_id = data.get("order_reference")
    status = data.get("status")  # 'SUCCESS' or 'FAILED'

    if not all([transaction_id, order_id, status]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Find payment by Airpay transaction ID
    payment = db.query(models.Payment).filter(
        models.Payment.airpay_transaction_id == transaction_id
    ).first()

    if not payment:
        # Payment not found - log but don't fail (webhook retry safety)
        print(f"Warning: Received webhook for unknown transaction {transaction_id}")
        return {"status": "received"}

    # Idempotency check
    if payment.webhook_processed == transaction_id:
        print(f"Webhook already processed for {transaction_id}")
        return {"status": "already_processed"}

    # Update payment status
    if status == "SUCCESS":
        payment.status = "SUCCESS"
        payment.webhook_processed = transaction_id

        # Update order status
        order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if order:
            order.status = "paid"
            order.paid_at = datetime.utcnow()

            # Free up table if dine-in
            if order.table_id:
                table = db.query(models.RestaurantTable).filter(
                    models.RestaurantTable.id == order.table_id
                ).first()
                if table:
                    table.status = "available"
                    table.current_order_id = None

        db.commit()

        # Broadcast update
        await manager.broadcast_update({
            "type": "PAYMENT_COMPLETED",
            "order_id": order_id,
            "payment_id": payment.id
        })

    elif status == "FAILED":
        payment.status = "FAILED"
        payment.webhook_processed = transaction_id

        order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if order:
            order.status = "pending_payment"

        db.commit()

        await manager.broadcast_update({
            "type": "PAYMENT_FAILED",
            "order_id": order_id,
            "payment_id": payment.id
        })

    return {"status": "processed"}
