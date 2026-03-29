from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
import os
import uuid
from auth_utils import verify_restaurant

router = APIRouter(prefix="/api", tags=["Uploads"])

BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
IMAGES_DIR = os.path.join(BACKEND_DIR, "static", "uploads", "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    restaurant_id: str = Depends(verify_restaurant),
):
    """Upload an image and return its public URL path."""
    if file.content_type not in ALLOWED_TYPES:
        return JSONResponse(
            status_code=400,
            content={"detail": f"Unsupported file type: {file.content_type}. Use JPEG, PNG, GIF or WebP."},
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        return JSONResponse(
            status_code=400,
            content={"detail": "File too large. Maximum size is 5 MB."},
        )

    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    filename = f"{restaurant_id}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(IMAGES_DIR, filename)

    try:
        with open(filepath, "wb") as f:
            f.write(contents)
    except OSError as e:
        import logging
        logging.error(f"Failed to write uploaded image to {filepath}: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to save the image on the server. The disk might be full."},
        )

    url = f"/static/uploads/images/{filename}"
    return {"url": url}
