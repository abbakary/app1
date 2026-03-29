
import sqlite3
import os

db_path = "c:/New folder/new/restflowapp123-main/restflowapp123-main/backend/restaurant.db"

def check_schema():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Columns in 'orders' table:")
    cursor.execute("PRAGMA table_info(orders)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"- {col[1]} ({col[2]})")
    
    print("\nColumns in 'restaurants' table:")
    cursor.execute("PRAGMA table_info(restaurants)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"- {col[1]} ({col[2]})")

    print("\nContent of 'restaurants' table:")
    cursor.execute("SELECT id, name, customer_portal_url FROM restaurants")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, Portal URL: {row[2]}")
    
    conn.close()

if __name__ == "__main__":
    check_schema()
