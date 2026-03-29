import re
import os
import httpx
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Unsplash API Configuration
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
UNSPLASH_API_URL = "https://api.unsplash.com/search/photos"

# Validate API key is present
if not UNSPLASH_ACCESS_KEY:
    print("WARNING: UNSPLASH_ACCESS_KEY not found in environment variables!")
    print("Please set it in your .env file or environment variables.")

# Predefined categories and their keywords (expanded for drinks)
CATEGORY_RULES = {
    "breakfast": ["coffee", "tea", "omelet", "pancake", "waffle", "bread", "toast", "egg", "cereal", "breakfast"],
    "starters": ["soup", "salad", "wings", "nuggets", "calamari", "garlic bread", "bruschetta", "starter", "appetizer"],
    "fast_food": ["pizza", "burger", "fries", "hotdog", "sandwich", "taco", "burrito", "fast food", "wrap"],
    "seafood": ["fish", "prawns", "shrimp", "lobster", "crab", "octopus", "seafood", "salmon", "tuna"],
    "grill_bbq": ["nyama choma", "grill", "bbq", "steak", "ribs", "lamb", "chicken grill", "kebab", "roasted"],
    "desserts": ["cake", "ice cream", "brownie", "pudding", "cookie", "dessert", "chocolate", "fruit salad"],
    "beverages": [
        # Sodas
        "fanta", "mirinda", "sprite", "coke", "coca-cola", "pepsi", "7up", "mountain dew", "dr pepper",
        "soda", "soft drink", "carbonated", "tonic", "ginger ale", "root beer",
        # Juices
        "juice", "fresh juice", "orange juice", "apple juice", "mango juice", "pineapple juice",
        "passion juice", "watermelon juice", "lemonade", "fruit punch", "smoothie",
        # Water
        "water", "mineral water", "sparkling water", "still water", "spring water",
        # Hot drinks
        "coffee", "tea", "hot chocolate", "espresso", "latte", "cappuccino", "mocha", "chai",
        # Alcoholic
        "beer", "wine", "cocktail", "whiskey", "vodka", "rum", "gin", "mojito", "martini",
        "margarita", "champagne", "spritzer", "cider",
        # Energy drinks
        "red bull", "monster", "energy drink",
        # Milkshakes & Dairy
        "milkshake", "lassi", "yogurt drink", "buttermilk", "milk",
        # Traditional/African drinks
        "chapman", "dawa", "konyagi", "kilimanjaro", "serengeti", "african tea", "masala chai"
    ],
    "main_course": []  # Default if no match
}

# Specific drink mappings for better image search
DRINK_SPECIFIC_QUERIES = {
    # Fanta variants
    "fanta orange": "fanta orange soda drink",
    "fanta passion": "fanta passion fruit soda",
    "fanta pineapple": "fanta pineapple soda",
    "fanta strawberry": "fanta strawberry soda",
    "fanta grape": "fanta grape soda",
    
    # Mirinda variants
    "mirinda orange": "mirinda orange soda",
    "mirinda strawberry": "mirinda strawberry soda",
    "mirinda pineapple": "mirinda pineapple soda",
    "mirinda passion": "mirinda passion fruit soda",
    
    # Other sodas
    "sprite": "sprite lemon lime soda",
    "coca cola": "coca cola soda drink",
    "coke": "coca cola soda",
    "pepsi": "pepsi cola soda",
    "7up": "7up lemon soda",
    "mountain dew": "mountain dew citrus soda",
    
    # Juices
    "orange juice": "fresh orange juice glass",
    "apple juice": "fresh apple juice glass",
    "mango juice": "fresh mango juice glass",
    "pineapple juice": "fresh pineapple juice glass",
    "watermelon juice": "fresh watermelon juice glass",
    "passion juice": "passion fruit juice glass",
    "lemonade": "fresh lemonade glass",
    
    # Coffee
    "coffee": "fresh coffee cup",
    "espresso": "espresso coffee cup",
    "latte": "latte coffee art",
    "cappuccino": "cappuccino coffee",
    "mocha": "mocha coffee",
    
    # Tea
    "tea": "hot tea cup",
    "green tea": "green tea cup",
    "masala chai": "masala chai indian tea",
    "lemon tea": "lemon tea cup",
    
    # Alcoholic
    "beer": "cold beer glass",
    "red wine": "red wine glass",
    "white wine": "white wine glass",
    "mojito": "mojito cocktail glass",
    "margarita": "margarita cocktail glass",
    "whiskey": "whiskey glass",
    
    # Milkshakes
    "chocolate milkshake": "chocolate milkshake glass",
    "strawberry milkshake": "strawberry milkshake glass",
    "vanilla milkshake": "vanilla milkshake glass",
    
    # Water
    "mineral water": "mineral water bottle glass",
    "sparkling water": "sparkling water glass",
}

# High-quality fallback images
FALLBACK_IMAGES = {
    "breakfast": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800&auto=format&fit=crop",
    "starters": "https://images.unsplash.com/photo-1541014741259-df549fa9bc67?q=80&w=800&auto=format&fit=crop",
    "fast_food": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=800&auto=format&fit=crop",
    "seafood": "https://images.unsplash.com/photo-1551248429-ac4c3f4a7209?q=80&w=800&auto=format&fit=crop",
    "grill_bbq": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
    "desserts": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800&auto=format&fit=crop",
    "beverages": "https://images.unsplash.com/photo-1544145945-f904253db0ad?q=80&w=800&auto=format&fit=crop",
    "main_course": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"
}

def normalize_drink_name(name: str) -> str:
    """Normalize drink names for better matching"""
    name_lower = name.lower().strip()
    
    # Handle Fanta variants
    if "fanta" in name_lower:
        if "orange" in name_lower:
            return "fanta orange"
        elif "passion" in name_lower:
            return "fanta passion"
        elif "pineapple" in name_lower:
            return "fanta pineapple"
        elif "strawberry" in name_lower:
            return "fanta strawberry"
        elif "grape" in name_lower:
            return "fanta grape"
        return "fanta"
    
    # Handle Mirinda variants
    if "mirinda" in name_lower:
        if "orange" in name_lower:
            return "mirinda orange"
        elif "strawberry" in name_lower:
            return "mirinda strawberry"
        elif "pineapple" in name_lower:
            return "mirinda pineapple"
        elif "passion" in name_lower:
            return "mirinda passion"
        return "mirinda"
    
    # Handle other common drinks
    if "coca-cola" in name_lower or "coke" in name_lower:
        return "coca cola"
    if "sprite" in name_lower:
        return "sprite"
    if "7up" in name_lower or "seven up" in name_lower:
        return "7up"
    if "pepsi" in name_lower:
        return "pepsi"
    if "mountain dew" in name_lower:
        return "mountain dew"
    
    return name_lower

def classify_category(name: str) -> str:
    """Classify menu item name into a category using keyword matching."""
    name_lower = name.lower()
    
    # Special handling for drinks
    if any(drink in name_lower for drink in ["fanta", "mirinda", "sprite", "coke", "pepsi", 
                                               "juice", "water", "coffee", "tea", "beer", 
                                               "wine", "cocktail", "milkshake"]):
        return "beverages"
    
    for category, keywords in CATEGORY_RULES.items():
        if any(keyword in name_lower for keyword in keywords):
            return category
    return "main_course"

def generate_tags(name: str) -> List[str]:
    """Generate tags by extracting keywords from the name."""
    words = re.findall(r'\b\w+\b', name.lower())
    ignore_words = {"with", "and", "the", "a", "of", "to", "in", "on", "all", "types"}
    tags = [word for word in words if len(word) > 2 and word not in ignore_words]
    return list(set(tags))

async def get_auto_image(name: str, category: Optional[str] = None) -> str:
    """
    Get a specific image for the menu item using Unsplash API.
    Tries to get an image matching the exact item name first,
    then falls back to category-based images if no results found.
    """
    # Check if API key is configured
    if not UNSPLASH_ACCESS_KEY:
        print(f"WARNING: No Unsplash API key found. Using fallback image for {name}")
        if category:
            return FALLBACK_IMAGES.get(category, FALLBACK_IMAGES["main_course"])
        return FALLBACK_IMAGES["main_course"]
    
    # If category not provided, classify it
    if not category:
        category = classify_category(name)
    
    try:
        # Normalize drink names for better search
        normalized_name = normalize_drink_name(name)
        
        # Check if we have a specific query mapping
        if normalized_name in DRINK_SPECIFIC_QUERIES:
            search_query = DRINK_SPECIFIC_QUERIES[normalized_name]
        else:
            search_query = normalized_name.strip()
        
        # First attempt: Search with specific query
        async with httpx.AsyncClient() as client:
            response = await client.get(
                UNSPLASH_API_URL,
                params={
                    "query": search_query,
                    "per_page": 1,
                    "orientation": "squarish",
                    "client_id": UNSPLASH_ACCESS_KEY
                },
                timeout=5.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    return data["results"][0]["urls"]["small"]
        
        # Second attempt: Try with original name
        async with httpx.AsyncClient() as client:
            response = await client.get(
                UNSPLASH_API_URL,
                params={
                    "query": name.strip(),
                    "per_page": 1,
                    "orientation": "squarish",
                    "client_id": UNSPLASH_ACCESS_KEY
                },
                timeout=5.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    return data["results"][0]["urls"]["small"]
        
        # Third attempt: Try with name and category
        search_query = f"{name} {category}".strip()
        async with httpx.AsyncClient() as client:
            response = await client.get(
                UNSPLASH_API_URL,
                params={
                    "query": search_query,
                    "per_page": 1,
                    "orientation": "squarish",
                    "client_id": UNSPLASH_ACCESS_KEY
                },
                timeout=5.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    return data["results"][0]["urls"]["small"]
        
        # Fourth attempt: Try with generated tags
        tags = generate_tags(name)
        if tags:
            tag_query = " ".join(tags[:3])
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    UNSPLASH_API_URL,
                    params={
                        "query": tag_query,
                        "per_page": 1,
                        "orientation": "squarish",
                        "client_id": UNSPLASH_ACCESS_KEY
                    },
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("results") and len(data["results"]) > 0:
                        return data["results"][0]["urls"]["small"]
            
        # Fallback to category-based image if all attempts fail
        return FALLBACK_IMAGES.get(category, FALLBACK_IMAGES["main_course"])
        
    except Exception as e:
        print(f"Error fetching Unsplash image for {name}: {e}")
        return FALLBACK_IMAGES.get(category, FALLBACK_IMAGES["main_course"])

# Optional: Cache images for better performance
class ImageCache:
    """Simple cache for storing fetched image URLs"""
    def __init__(self):
        self.cache = {}
    
    async def get_image(self, name: str, category: Optional[str] = None) -> str:
        """Get image from cache or fetch new one"""
        cache_key = f"{name}_{category}" if category else name
        if cache_key not in self.cache:
            self.cache[cache_key] = await get_auto_image(name, category)
        return self.cache[cache_key]

# Example usage and test cases
async def test_drink_images():
    """Test function to verify drink images work correctly"""
    test_drinks = [
        "Fanta Orange",
        "Fanta Passion",
        "Mirinda Strawberry",
        "Sprite",
        "Coca-Cola",
        "Fresh Orange Juice",
        "Mango Juice",
        "Coffee",
        "Green Tea",
        "Beer",
        "Chocolate Milkshake",
        "Mineral Water"
    ]
    
    for drink in test_drinks:
        image_url = await get_auto_image(drink)
        print(f"{drink}: {image_url}")

# To run the test:
# import asyncio
# asyncio.run(test_drink_images())