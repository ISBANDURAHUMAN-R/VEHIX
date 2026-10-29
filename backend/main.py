import os
import shutil
import uuid
from pathlib import Path
from typing import List, Dict

import cv2
from fastapi import FastAPI, File, UploadFile, HTTPException
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
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
ALLOWED_EXTS = {ext.lower().strip() for ext in os.getenv("ALLOWED_EXTS", "jpg,jpeg,png,webp").split(",")}
CONF_THRESH = float(os.getenv("CONF_THRESH", "0.30"))
IOU_THRESH = float(os.getenv("IOU_THRESH", "0.45"))

# Directories (created automatically if missing)
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
RESULT_DIR = BASE_DIR / "results"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

# Import detection utilities
try:
    from .detector import get_detector, YOLODetector
    from .counter import count_vehicles
except (ImportError, ValueError):
    from detector import get_detector, YOLODetector
    from counter import count_vehicles

app = FastAPI(
    title="VEHIX — Vehicle Detection API",
    description="FastAPI service powered by YOLO for vehicle detection, classification, and counting.",
    version="1.0.0",
)

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve annotated images statically
app.mount("/results", StaticFiles(directory=str(RESULT_DIR)), name="results")

# Pydantic models
class DetectionItem(BaseModel):
    model_config = {"populate_by_name": True}
    class_: str = Field(..., alias="class")
    confidence: float
    bbox: List[int]  # [x1, y1, x2, y2]

class DetectionResult(BaseModel):
    total_vehicles: int
    counts: Dict[str, int]
    detections: List[DetectionItem]
    result_image: str  # URL path to the annotated or uploaded image

class HealthResponse(BaseModel):
    status: str
    version: str

def validate_upload(file: UploadFile) -> Path:
    """Validate size, extension and save uploaded file to disk."""
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '.{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTS))}",
        )

    contents = file.file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({size_mb:.2f} MB) exceeds limit of {MAX_UPLOAD_SIZE_MB} MB.",
        )

    safe_name = f"{uuid.uuid4()}.{ext}"
    save_path = UPLOAD_DIR / safe_name
    with open(save_path, "wb") as f:
        f.write(contents)
    return save_path

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/detect", response_model=DetectionResult)
async def detect_vehicles(file: UploadFile = File(...)):
    # 1. Validate and store upload
    try:
        image_path = validate_upload(file)
    finally:
        await file.close()

    # 2. Run YOLO inference
    detector: YOLODetector = get_detector()
    detections = detector.predict(str(image_path))

    # 3. Count vehicle classes
    counts = count_vehicles(detections)
    total = sum(counts.values())

    # 4. Generate result image
    result_filename = f"{uuid.uuid4()}.jpg"
    result_path = RESULT_DIR / result_filename

    if detections:
        detector.draw_annotations(str(image_path), detections, str(result_path))
    else:
        # If no vehicles detected, copy original image so the user still sees preview
        img = cv2.imread(str(image_path))
        if img is not None:
            cv2.imwrite(str(result_path), img)
        else:
            shutil.copyfile(image_path, result_path)

    result_url = f"/results/{result_filename}"

    # 5. Build response payload
    detection_items = [
        DetectionItem(class_=d["class"], confidence=d["confidence"], bbox=d["bbox"])
        for d in detections
    ]
    return DetectionResult(
        total_vehicles=total,
        counts=counts,
        detections=detection_items,
        result_image=result_url,
    )

__all__ = ["app", "HOST", "PORT"]
