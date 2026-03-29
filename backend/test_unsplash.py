import asyncio
import os
from smart_menu_utils import get_auto_image

async def test_image_generation():
    print("Testing Image Generation with Unsplash API...")
    
    # Test cases
    items = [
        ("Classic Pepperoni Pizza", "fast_food"),
        ("Iced Caramel Macchiato", "beverages"),
        ("Greek Salad", "starters"),
        ("Unknown Food Item", "main_course")
    ]
    
    # Check if API key is set
    ak = os.getenv("UNSPLASH_ACCESS_KEY")
    if not ak:
        print("\nWARNING: UNSPLASH_ACCESS_KEY not set in environment.")
        print("Falling back to category defaults.\n")
    else:
        print(f"\nUNSPLASH_ACCESS_KEY is set. Testing real API calls...\n")

    for name, category in items:
        image_url = await get_auto_image(name, category)
        print(f"Item: {name:25} | Category: {category:12} | URL: {image_url}")
        
        # Basic validation
        if not image_url.startswith("http"):
            print(f"  FAILED: Invalid URL returned for {name}")

if __name__ == "__main__":
    asyncio.run(test_image_generation())
