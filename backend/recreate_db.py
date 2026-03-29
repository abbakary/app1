from database import engine, Base
import models

def recreate_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating all tables with current schema...")
    Base.metadata.create_all(bind=engine)
    print("Database schema updated successfully!")

if __name__ == "__main__":
    recreate_database()
