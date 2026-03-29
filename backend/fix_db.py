import sqlite3
import os

db_path = "restaurant.db"

if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE orders ADD COLUMN driver_id VARCHAR;")
    print("Added driver_id to orders.")
except sqlite3.OperationalError as e:
    print(f"driver_id: {e}")

try:
    cursor.execute("ALTER TABLE orders ADD COLUMN assigned_at DATETIME;")
    print("Added assigned_at to orders.")
except sqlite3.OperationalError as e:
    print(f"assigned_at: {e}")

conn.commit()

# Create drivers table if it doesn't exist
try:
    from database import engine, Base
    import models
    Base.metadata.create_all(bind=engine)
    print("Created missing tables.")
except Exception as e:
    print(f"Error creating tables: {e}")

conn.close()
