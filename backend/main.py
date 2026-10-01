import os
import uuid
from pathlib import Path
from typing import List, Dict

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration – can be overridden via .env
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "5"))
ALLOWED_EXTS = {ext.lower() for ext in os.getenv("ALLOWED_EXTS", "jpg,jpeg,png,webp").split(",")}
CONF_THRESH = float(os.getenv("CONF_THRESH", "0.30"))
IOU_THRESH = float(os.getenv("IOU_THRESH", "0.45"))

# Directories (will be created if missing)
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
RESULT_DIR = BASE_DIR / "results"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

# Import our detection utilities
try:
    from .detector import get_detector, YOLODetector
    from .counter import count_vehicles
except (ImportError, ValueError):
    from detector import get_detector, YOLODetector
    from counter import count_vehicles

app = FastAPI(title="Vehicle Detection API")

# CORS – allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve annotated images statically
app.mount("/results", StaticFiles(directory=str(RESULT_DIR)), name="results")

# Pydantic models for responses
class DetectionItem(BaseModel):
    model_config = {"populate_by_name": True}
    class_: str = Field(..., alias="class")
    confidence: float
    bbox: List[int]  # [x1, y1, x2, y2]

class DetectionResult(BaseModel):
    total_vehicles: int
    counts: Dict[str, int]
    detections: List[DetectionItem]
    result_image: str  # URL path to the annotated image

class HealthResponse(BaseModel):
    status: str

def validate_upload(file: UploadFile) -> Path:
    """Validate size, extension and save the uploaded file to the uploads directory.
    Returns the absolute path to the saved file.
    """
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="No file provided.")
    ext = filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension '.{ext}'. Allowed: {', '.join(ALLOWED_EXTS)}")
    # Read contents to enforce size limit
    contents = file.file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_UPLOAD_SIZE_MB} MB limit.")
    # Save with a UUID filename to avoid collisions
    safe_name = f"{uuid.uuid4()}.{ext}"
    save_path = UPLOAD_DIR / safe_name
    with open(save_path, "wb") as f:
        f.write(contents)
    return save_path

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "healthy"}

@app.post("/api/detect", response_model=DetectionResult)
async def detect_vehicles(file: UploadFile = File(...)):
    # Step 1 – Validate and store upload
    try:
        image_path = validate_upload(file)
    finally:
        await file.close()

    # Step 2 – Run YOLO inference
    detector: YOLODetector = get_detector()
    detections = detector.predict(str(image_path))

    # Step 3 – Count per class (may be empty)
    counts = count_vehicles(detections)
    total = sum(counts.values())

    # Step 4 – Generate annotated image only if detections exist
    if detections:
        result_filename = f"{uuid.uuid4()}.jpg"
        result_path = RESULT_DIR / result_filename
        detector.draw_annotations(str(image_path), detections, str(result_path))
        result_url = f"/results/{result_filename}"
    else:
        result_url = ""

    # Build response
    detection_items = [
        DetectionItem(class_=d["class"], confidence=d["confidence"], bbox=d["bbox"]) for d in detections
    ]
    return DetectionResult(
        total_vehicles=total,
        counts=counts,
        detections=detection_items,
        result_image=result_url,
    )

# Optional: clean‑up old files (simple implementation – run manually or via a cron job)
def _cleanup_folder(folder: Path, max_files: int = 1000):
    files = sorted(folder.iterdir(), key=lambda p: p.stat().st_mtime)
    for f in files[:-max_files]:
        try:
            f.unlink()
        except Exception:
            pass

# Expose configuration constants for external scripts if needed
__all__ = ["app", "HOST", "PORT"]
