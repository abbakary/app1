# RestauFlow Backend (FastAPI)

This is the fully functioning FastAPI backend for the RestauFlow restaurant management app! It replaces the mocked `use-restaurant-data.ts` hooks with a real SQLite database.

## Architecture Let's Talk
* **Database**: SQLite via SQLAlchemy (`models.py`)
* **Validation**: Pydantic schemas matching your TypeScript types (`schemas.py`)
* **Real-time**: FastAPI WebSockets orchestrate the live Kitchen-to-Reception sync (`main.py`)
* **API**: Standard CRUD operations for Orders, Tables, and Menu Items

## How to Run the Server

1. Open a new terminal and navigate to this directory:
   ```bash
   cd "backend"
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

## Next Steps for the Frontend

Right now, your React app uses mocked data in `hooks/use-restaurant-data.ts`. 
To connect this new backend:
1. Replace the inner logic of `useMenuItems`, `useOrder`, etc. with `fetch('http://localhost:8000/api/...')`.
2. Inside your providers, connect to `ws://localhost:8000/ws` using standard WebSockets. When the frontend receives `"type": "NEW_ORDER"`, trigger a React Query query invalidation!
