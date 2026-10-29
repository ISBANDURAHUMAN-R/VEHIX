import argparse
import functools
from pathlib import Path

import torch

# PyTorch 2.6+ changed torch.load default to weights_only=True which breaks YOLO checkpoint unpickling.
_orig_torch_load = torch.load

@functools.wraps(_orig_torch_load)
def _patched_torch_load(*args, **kwargs):
    if "weights_only" not in kwargs:
        kwargs["weights_only"] = False
    return _orig_torch_load(*args, **kwargs)

torch.load = _patched_torch_load

from ultralytics import YOLO

def parse_args():
    parser = argparse.ArgumentParser(description="Train YOLO model for vehicle detection")
    parser.add_argument("--data", default="dataset/data.yaml", help="Path to dataset yaml file")
    parser.add_argument("--model", default="yolov8n.pt", help="Pretrained YOLO model to start from")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size for training")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--project", default="training/runs", help="Directory to save training runs")
    parser.add_argument("--name", default="exp", help="Name of this experiment")
    return parser.parse_args()

def main():
    args = parse_args()
    model_path = args.model

    # Check for local backend weights fallback
    if not Path(model_path).exists():
        backend_weights = Path(__file__).resolve().parent.parent / "backend" / "models" / "yolov8n.pt"
        if backend_weights.exists():
            model_path = str(backend_weights)

    print(f"Loading base YOLO model from: {model_path}")
    model = YOLO(model_path)
    model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
    )
    print("Training complete. The best checkpoint is saved in the experiment run folder.")

if __name__ == "__main__":
    main()
