import sys
import os

# Add the current directory to sys.path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import models
    from sqlalchemy.orm import Session
    from database import SessionLocal
    
    # Check if Order has status attribute
    if hasattr(models.Order, 'status'):
        print("SUCCESS: Order model has 'status' attribute.")
    else:
        print("ERROR: Order model MISSING 'status' attribute.")
        
    # Check if Order has order_status attribute (it should NOT)
    if hasattr(models.Order, 'order_status'):
        print("ERROR: Order model STILL has 'order_status' attribute.")
    else:
        print("SUCCESS: Order model DOES NOT have 'order_status' attribute.")

    # Try to build a query part like in the router
    # We don't need a real DB connection for this check, just the SQLAlchemy model
    from sqlalchemy import not_
    query_filter = (models.Order.status != "paid")
    print(f"SUCCESS: Successfully created query filter: {query_filter}")

except ImportError as e:
    print(f"Import Error: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
