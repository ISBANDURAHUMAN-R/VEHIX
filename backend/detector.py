import os
import uuid
from pathlib import Path
from typing import List, Dict

import cv2
import numpy as np
from ultralytics import YOLO

from dotenv import load_dotenv

load_dotenv()

# Environment configuration defaults (can be overridden via .env)
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = str(BASE_DIR / "models" / "yolov8n.pt")
MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)
CONF_THRESH = float(os.getenv("CONF_THRESH", "0.30"))
IOU_THRESH = float(os.getenv("IOU_THRESH", "0.45"))

class YOLODetector:
    """Wrapper around Ultralytics YOLO model for vehicle detection.

    The model is lazily loaded on first inference to keep startup fast.
    """

    def __init__(self, model_path: str = MODEL_PATH, conf: float = CONF_THRESH, iou: float = IOU_THRESH):
        self.model_path = model_path
        self.conf = conf
        self.iou = iou
        self._model = None
        self._device = "cuda" if self._cuda_available() else "cpu"

    @staticmethod
    def _cuda_available() -> bool:
        try:
            import torch
            return torch.cuda.is_available()
        except Exception:
            return False

    @property
    def model(self) -> YOLO:
        if self._model is None:
            resolved_path = self.model_path
            if not Path(resolved_path).exists():
                alt_path = BASE_DIR / "models" / Path(resolved_path).name
                if alt_path.exists():
                    resolved_path = str(alt_path)
                elif Path(Path(resolved_path).name).exists():
                    resolved_path = str(Path(Path(resolved_path).name).resolve())
            self._model = YOLO(resolved_path)
            # Ensure model uses the correct device
            self._model.to(self._device)
        return self._model

    def predict(self, image_path: str) -> List[Dict]:
        """Run inference on an image and return a list of detections.

        Each detection dict contains:
            - class (str)
            - confidence (float, 0-1)
            - bbox (list[int]) in [x1, y1, x2, y2] pixel coordinates
        """
        results = self.model.predict(source=image_path, conf=self.conf, iou=self.iou, device=self._device, verbose=False)
        detections: List[Dict] = []
        if not results:
            return detections
        # Ultralytics returns a list, usually of length 1 when source is a file
        result = results[0]
        boxes = result.boxes  # Boxes object
        if boxes is None or boxes.shape[0] == 0:
            return detections
        VEHICLE_CLASSES = {"car", "motorcycle", "bus", "truck", "bicycle"}
        for box in boxes:
            cls_val = box.cls.cpu().numpy()
            cls_id = int(cls_val.item() if cls_val.size == 1 else cls_val[0])
            class_name = self.model.names.get(cls_id, f"class_{cls_id}").lower()

            # Filter to vehicle categories
            if class_name not in VEHICLE_CLASSES:
                continue

            conf_val = box.conf.cpu().numpy()
            conf = float(conf_val.item() if conf_val.size == 1 else conf_val[0])
            # xyxy format
            xyxy = box.xyxy.cpu().numpy().astype(int).flatten().tolist()
            detections.append({
                "class": class_name,
                "confidence": round(conf, 4),
                "bbox": xyxy,
            })
        return detections

    @staticmethod
    def draw_annotations(image_path: str, detections: List[Dict], output_path: str) -> None:
        """Draw bounding boxes, class labels and confidence percentages on the image.
        Saves the annotated image to ``output_path``.
        """
        img = cv2.imread(image_path)
        if img is None:
            raise FileNotFoundError(f"Unable to read image at {image_path}")
        CLASS_COLORS_BGR = {
            "car": (212, 182, 6),       # Cyan-ish blue in BGR
            "motorcycle": (94, 63, 244),# Rose
            "bus": (129, 185, 16),      # Emerald
            "truck": (11, 158, 245),    # Amber
            "bicycle": (246, 92, 139),  # Purple
        }

        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            label = f"{det['class']} {det['confidence'] * 100:.0f}%"
            cls_lower = det["class"].lower()
            color = CLASS_COLORS_BGR.get(cls_lower, tuple(int((abs(hash(cls_lower)) >> i) & 0xFF) for i in (0, 8, 16)))
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            # Put label above the box
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            y_label = max(y1, h + 6)
            cv2.rectangle(img, (x1, y_label - h - 4), (x1 + w + 4, y_label), color, -1)
            cv2.putText(
                img,
                label,
                (x1 + 2, y_label - 2),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )
        cv2.imwrite(output_path, img)

# Singleton detector used by the FastAPI app
_detector_instance = YOLODetector()

def get_detector() -> YOLODetector:
    return _detector_instance
