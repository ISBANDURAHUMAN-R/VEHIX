import argparse
from pathlib import Path

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
    # Load model (will download if not present)
    model = YOLO(model_path)
    model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
    )
    # After training, the best model is saved as best.pt in the run folder.
    # Users should copy it to backend/models/ as needed.

if __name__ == "__main__":
    main()
