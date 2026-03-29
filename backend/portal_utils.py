import re
import uuid
from sqlalchemy.orm import Session
import models


def generate_portal_slug(restaurant_name: str) -> str:
    """
    Generate a URL-friendly slug from restaurant name
    Example: "The Italian Restaurant" -> "the-italian-restaurant"
    """
    # Convert to lowercase and remove extra whitespace
    slug = restaurant_name.lower().strip()
    
    # Replace non-alphanumeric characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    
    # Remove leading and trailing hyphens
    slug = slug.strip('-')
    
    return slug if slug else "restaurant"


def generate_unique_portal_url(restaurant_name: str, db: Session) -> str:
    """
    Generate a unique customer portal URL (slug) for a restaurant.
    If the slug already exists, append a random suffix.
    
    Returns: unique slug like "restaurant-name" or "restaurant-name-abc123"
    """
    base_slug = generate_portal_slug(restaurant_name)
    
    if not base_slug:
        # Fallback if name is empty or has no valid characters
        base_slug = "restaurant"
    
    # Check if this slug already exists
    existing = db.query(models.Restaurant).filter(
        models.Restaurant.customer_portal_url == base_slug
    ).first()
    
    if not existing:
        return base_slug
    
    # Generate unique slug with suffix
    counter = 1
    while True:
        unique_slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
        existing = db.query(models.Restaurant).filter(
            models.Restaurant.customer_portal_url == unique_slug
        ).first()
        if not existing:
            return unique_slug
        counter += 1
        if counter > 10:
            # Failsafe: use random UUID if we can't find unique slug
            return f"{base_slug}-{uuid.uuid4()}"


def get_restaurant_by_portal_url(portal_url: str, db: Session) -> models.Restaurant | None:
    """
    Fetch restaurant by customer portal URL (slug)
    """
    return db.query(models.Restaurant).filter(
        models.Restaurant.customer_portal_url == portal_url
    ).first()
