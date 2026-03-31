"""
Restaurant analytics: customers, menu performance, and insight recommendations.
Optional OpenAI enrichment when OPENAI_API_KEY is set.
"""
from __future__ import annotations

import json
import os
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set
from statistics import mean, median

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

import models
from auth_utils import verify_restaurant
from database import get_db

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


def _normalize_category(raw: Optional[str]) -> str:
    if not raw:
        return "other"
    key = raw.strip().lower().replace(" ", "_")
    m = {
        "appetizer": "appetizer",
        "starters": "appetizer",
        "starter": "appetizer",
        "side": "side",
        "sides": "side",
        "main": "main",
        "main_course": "main",
        "fast_food": "main",
        "seafood": "main",
        "grill_bbq": "main",
        "breakfast": "main",
        "dessert": "dessert",
        "desserts": "dessert",
        "beverage": "beverage",
        "beverages": "beverage",
    }
    return m.get(key, key if key in ("appetizer", "main", "side", "dessert", "beverage") else "other")


def _paid_orders_query(db: Session, restaurant_id: str):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.menu_item),
        )
        .filter(models.Order.restaurant_id == restaurant_id)
        .filter(models.Order.status == "paid")
    )


def _menu_popularity_data(db: Session, restaurant_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    orders = _paid_orders_query(db, restaurant_id).all()
    stats: Dict[str, Dict[str, Any]] = {}
    order_ids_by_item: Dict[str, Set[str]] = defaultdict(set)
    for o in orders:
        for li in o.items:
            mid = li.menu_item_id
            mi = li.menu_item
            if not mi:
                continue
            stats.setdefault(
                mid,
                {
                    "menu_item_id": mid,
                    "name": mi.name,
                    "category": mi.category,
                    "category_normalized": _normalize_category(mi.category),
                    "quantity_sold": 0,
                    "revenue": 0.0,
                },
            )
            stats[mid]["quantity_sold"] += li.quantity
            stats[mid]["revenue"] += float(mi.price) * li.quantity
            order_ids_by_item[mid].add(o.id)
    for mid, row in stats.items():
        row["order_count"] = len(order_ids_by_item[mid])

    ranked = sorted(stats.values(), key=lambda x: (-x["quantity_sold"], -x["revenue"]))
    return ranked[:limit]


def _category_revenue_data(db: Session, restaurant_id: str) -> List[Dict[str, Any]]:
    orders = _paid_orders_query(db, restaurant_id).all()
    buckets: Dict[str, Dict[str, float]] = defaultdict(lambda: {"quantity": 0.0, "revenue": 0.0})
    for o in orders:
        for li in o.items:
            mi = li.menu_item
            if not mi:
                continue
            b = _normalize_category(mi.category)
            buckets[b]["quantity"] += li.quantity
            buckets[b]["revenue"] += float(mi.price) * li.quantity
    return [
        {
            "category": k,
            "quantity": int(v["quantity"]),
            "revenue": round(v["revenue"], 2),
        }
        for k, v in sorted(buckets.items(), key=lambda x: -x[1]["revenue"])
    ]


def _list_customer_analytics_data(db: Session, restaurant_id: str) -> List[Dict[str, Any]]:
    customers = (
        db.query(models.User)
        .filter(models.User.restaurant_id == restaurant_id)
        .filter(models.User.role == "customer")
        .all()
    )
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.menu_item))
        .filter(models.Order.restaurant_id == restaurant_id)
        .all()
    )
    by_customer: Dict[str, List[models.Order]] = defaultdict(list)
    for o in orders:
        if o.customer_id:
            by_customer[o.customer_id].append(o)

    result = []
    for c in customers:
        cos = sorted(by_customer.get(c.id, []), key=lambda x: x.created_at or datetime.min, reverse=True)
        paid = [x for x in cos if x.status == "paid"]
        total_spent = sum(float(x.total or 0) for x in paid)
        item_counts: Dict[str, int] = defaultdict(int)
        locations: set = set()
        type_counts: Dict[str, int] = defaultdict(int)
        for o in cos:
            if o.order_type:
                type_counts[o.order_type] += 1
            if o.delivery_address and str(o.delivery_address).strip():
                locations.add(str(o.delivery_address).strip()[:200])
            for li in o.items:
                if li.menu_item:
                    item_counts[li.menu_item.name] += li.quantity
        top_items = sorted(item_counts.items(), key=lambda x: -x[1])[:5]
        last_at = cos[0].created_at if cos else None
        result.append(
            {
                "user_id": c.id,
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "username": c.username,
                "registered_at": c.created_at.isoformat() if c.created_at else None,
                "order_count": len(paid),
                "visit_count": len(cos),
                "total_spent": round(total_spent, 2),
                "last_order_at": last_at.isoformat() if last_at else None,
                "favorite_menu_items": [t[0] for t in top_items],
                "locations": list(locations),
                "order_type_breakdown": dict(type_counts),
            }
        )
    result.sort(key=lambda x: (-x["total_spent"], -x["order_count"]))
    return result


@router.get("/menu-popularity")
def menu_popularity(
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant),
    limit: int = 20,
):
    return _menu_popularity_data(db, restaurant_id, limit)


@router.get("/category-revenue")
def category_revenue(
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant),
):
    return _category_revenue_data(db, restaurant_id)


@router.get("/customers")
def list_customer_analytics(
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant),
):
    return _list_customer_analytics_data(db, restaurant_id)


@router.get("/customers/{user_id}")
def customer_detail(
    user_id: str,
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant),
):
    c = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .filter(models.User.restaurant_id == restaurant_id)
        .filter(models.User.role == "customer")
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.menu_item))
        .filter(models.Order.restaurant_id == restaurant_id)
        .filter(models.Order.customer_id == user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return {
        "user": {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "username": c.username,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        },
        "orders": [
            {
                "id": o.id,
                "status": o.status,
                "total": float(o.total or 0),
                "order_type": o.order_type,
                "delivery_address": o.delivery_address,
                "customer_phone": o.customer_phone,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "paid_at": o.paid_at.isoformat() if o.paid_at else None,
                "items": [
                    {
                        "name": li.menu_item.name if li.menu_item else "",
                        "quantity": li.quantity,
                        "line_total": float((li.menu_item.price if li.menu_item else 0) * li.quantity),
                    }
                    for li in o.items
                ],
            }
            for o in orders
        ],
    }


def _rule_based_recommendations(
    menu_top: List[Dict[str, Any]],
    cat_rev: List[Dict[str, Any]],
    customer_rows: List[Dict[str, Any]],
) -> List[str]:
    recs: List[str] = []
    if menu_top:
        top = menu_top[0]
        recs.append(
            f"“{top['name']}” leads in volume ({top['quantity_sold']} units). "
            "Consider featuring it in promotions or pairing suggestions."
        )
    if len(menu_top) > 3:
        slow = menu_top[-1]
        if slow.get("quantity_sold", 0) <= 2:
            recs.append(
                f"Low rotation on “{slow['name']}”. Review pricing, photos, or placement on the menu."
            )
    if cat_rev:
        best = cat_rev[0]
        worst = cat_rev[-1] if len(cat_rev) > 1 else None
        recs.append(
            f"Highest revenue category: {best['category']} (${best['revenue']:.2f}). "
            + (
                f" Lowest: {worst['category']} (${worst['revenue']:.2f}) — test bundles or staff recommendations."
                if worst
                else ""
            )
        )
    high_value = [r for r in customer_rows if r.get("total_spent", 0) >= 100]
    if high_value:
        recs.append(
            f"You have {len(high_value)} high-value customers (lifetime spend ≥ $100). "
            "A loyalty note or small perk can improve retention."
        )
    inactive = []
    cutoff = datetime.utcnow() - timedelta(days=30)
    for r in customer_rows:
        lo = r.get("last_order_at")
        if not lo:
            continue
        try:
            dt = datetime.fromisoformat(lo.replace("Z", "+00:00"))
            if dt.replace(tzinfo=None) < cutoff:
                inactive.append(r.get("name") or r.get("user_id"))
        except Exception:
            continue
    if len(inactive) >= 3:
        recs.append(
            f"{len(inactive)} customers had no orders in 30+ days. A targeted campaign (SMS/email) may win them back."
        )
    if not recs:
        recs.append("Collect more paid orders to unlock richer behavioral patterns.")
    return recs[:8]


async def _optional_openai_summary(payload: Dict[str, Any]) -> Optional[tuple[str, str]]:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    try:
        import httpx

        prompt = (
            "You are a restaurant analytics assistant. Given JSON metrics for ONE restaurant, "
            "write 3-5 short bullet recommendations for the reception/manager team. "
            "Be specific to the numbers. No markdown headings. Plain text bullets starting with •\n\n"
            f"{json.dumps(payload, default=str)}"
        )
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": os.getenv("OPENAI_ANALYTICS_MODEL", "gpt-4o-mini"),
                    "messages": [
                        {"role": "system", "content": "Concise business analytics for restaurants."},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 500,
                    "temperature": 0.4,
                },
            )
        if r.status_code != 200:
            return None
        data = r.json()
        text = data["choices"][0]["message"]["content"].strip()
        model = data.get("model", "openai")
        return text, model
    except Exception:
        return None


@router.get("/insights")
async def combined_insights(
    db: Session = Depends(get_db),
    restaurant_id: str = Depends(verify_restaurant),
):
    menu_top = _menu_popularity_data(db, restaurant_id, 15)
    cat_rev = _category_revenue_data(db, restaurant_id)
    customer_rows = _list_customer_analytics_data(db, restaurant_id)

    recommendations = _rule_based_recommendations(menu_top, cat_rev, customer_rows)

    summary_payload = {
        "top_menu": menu_top[:5],
        "category_revenue": cat_rev,
        "customer_count": len(customer_rows),
        "avg_spend_top3": (
            round(sum(r["total_spent"] for r in customer_rows[:3]) / 3, 2) if len(customer_rows) >= 3 else None
        ),
    }
    ai_summary = None
    ai_model = None
    oa = await _optional_openai_summary(summary_payload)
    if oa:
        ai_summary, ai_model = oa

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "menu_top": menu_top,
        "category_revenue": cat_rev,
        "customers": customer_rows,
        "recommendations": recommendations,
        "ai_summary": ai_summary,
        "ai_model": ai_model,
    }
