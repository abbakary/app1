import sqlite3
import os

db_path = "backend/restaurant.db"

if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Checking for 'tags' column in 'menu_items'...")
        cursor.execute("PRAGMA table_info(menu_items)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "tags" not in columns:
            print("Adding 'tags' column...")
            cursor.execute("ALTER TABLE menu_items ADD COLUMN tags JSON")
            conn.commit()
            print("Successfully added 'tags' column.")
        else:
            print("'tags' column already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Error during migration: {e}")
