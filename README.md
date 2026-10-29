<div align="center">

# 🚗 VEHIX — Intelligent Vehicle Detection System

**AI-powered real-time vehicle detection, classification, counting, and visual analytics platform.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.3.4-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Ultralytics YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00599C.svg?logo=python&logoColor=white)](https://github.com/ultralytics/ultralytics)
[![Python](https://img.shields.io/badge/Python-3.10%20|%203.11%20|%203.12-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)

</div>

---

## 📌 Overview

**VEHIX** is an end-to-end computer vision platform designed for intelligent traffic and road surveillance analysis. By combining a **FastAPI** backend with **Ultralytics YOLOv8** neural detection and a reactive **Vite + React + Tailwind CSS** frontend, VEHIX transforms raw road imagery into structured vehicle metrics, category counts, confidence ratings, and annotated visual outputs.

---

## ✨ Key Features

- 🚘 **Neural Object Detection**: Utilizes YOLOv8 for precise vehicle localization.
- 🏷️ **Multi-Class Vehicle Classification**: Detects and categorizes `cars`, `buses`, `trucks`, `motorcycles`, and `bicycles`.
- 🔢 **Automated Vehicle Counting**: Real-time aggregation per vehicle class with visual distribution metrics.
- 🖼️ **Annotated Image Generation**: Automatic rendering of colored bounding boxes, labels, and percentage confidence scores onto images.
- 📊 **Interactive Analytics Dashboard**: Donut charts, category breakdown progress bars, and full detection coordinate inspection tables.
- ⚡ **Asynchronous REST API**: High-performance FastAPI endpoints with automated OpenAPI / Swagger interactive documentation.
- 🌐 **Modern Glassmorphic UI**: Built with dark mode, fluid micro-animations, and full responsive design.
- 🚀 **One-Click Startup**: Windows PowerShell launcher to initialize backend and frontend environments automatically.

---

## 🧠 System Architecture

```text
┌──────────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐
│     User Client      │ ──────> │  Vite / React Frontend │ ──────> │    FastAPI Backend     │
│ (Image Upload / Drop)│         │     (Port 5173)        │         │      (Port 8000)       │
└──────────────────────┘         └────────────────────────┘         └───────────┬────────────┘
                                                                                │
                                                                                ▼
┌────────────────────────────────────────────────────────┐          ┌───────────────────────┐
│                    Output Payload                      │ <─────── │   YOLOv8 Inference    │
│  - Total Vehicle Count                                 │          │   - Object Detection  │
│  - Per-Class Quantities                                │          │   - Classification    │
│  - Coordinate Bounding Boxes [x1, y1, x2, y2]          │          │   - Confidence Scores │
│  - Annotated Visualization Image                       │          │   - Bounding Box Math │
└────────────────────────────────────────────────────────┘          └───────────────────────┘
```

---

## 📂 Project Structure

```text
VEHIX/
├── backend/
│   ├── models/
│   │   └── yolov8n.pt         # Pretrained YOLOv8 weights (COCO)
│   ├── results/               # Generated annotated outputs
│   ├── uploads/               # Temporary uploaded source images
│   ├── __init__.py
│   ├── counter.py             # Class counting and aggregation utilities
│   ├── detector.py            # Ultralytics YOLO detector wrapper and CV2 annotation
│   ├── main.py                # FastAPI endpoints and static mounts
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── public/
│   │   └── samples/           # Demonstration images for instant testing
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnnotatedImage.tsx   # Image viewer with fullscreen & table view
│   │   │   ├── ResultDashboard.tsx  # Analytics summary, donut chart, and stats
│   │   │   └── UploadArea.tsx       # Drag-and-drop file upload with sample loader
│   │   ├── App.tsx                  # Main application state and connectivity polling
│   │   ├── index.css                # Tailwind base directives and custom design tokens
│   │   └── main.tsx                 # React DOM mount point
│   ├── index.html                   # HTML template with Google Fonts
│   ├── package.json                 # Node.js dependencies and build scripts
│   ├── postcss.config.js            # PostCSS configuration
│   ├── tailwind.config.js           # Tailwind CSS theme configuration
│   ├── tsconfig.json                # TypeScript compiler configuration
│   └── vite.config.ts               # Vite configuration with backend proxy
│
├── training/
│   └── train.py               # Custom YOLO dataset training script
│
├── .env.example               # Environment variables template
├── .gitignore                 # Version control exclusion rules
├── full-setup.ps1             # Automated installation and launch script
├── setup-and-run.ps1          # One-click Windows runner
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Python**: Version `3.10`, `3.11`, or `3.12` (recommended for PyTorch wheel compatibility).
- **Node.js**: Version `18.0.0` or higher (`v20+` recommended).
- **Git**

---

### Option 1: One-Click Launch (Windows)

Open PowerShell in the project root directory and run:

```powershell
.\setup-and-run.ps1
```

This script will automatically:
1. Detect your Python runtime (preferring Python 3.12).
2. Create the backend virtual environment in `backend/.venv`.
3. Install backend dependencies via `pip` or `uv`.
4. Install frontend npm dependencies in `frontend/`.
5. Launch the **FastAPI Backend** (`http://127.0.0.1:8000`) and **Vite Frontend** (`http://localhost:5173`) in dedicated windows.

---

### Option 2: Manual Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/ISBANDURAHUMAN-R/VEHIX.git
cd VEHIX
```

#### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv backend/.venv

# Windows:
backend\.venv\Scripts\activate

# Linux / macOS:
source backend/.venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# Start FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API**: `http://127.0.0.1:8000`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`

#### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

- **Web Application**: `http://localhost:5173`

---

## 📡 API Reference

### Health Check

```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

### Detect Vehicles

```http
POST /api/detect
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Image file (`.jpg`, `.jpeg`, `.png`, `.webp`, max 10MB)

**Response (200 OK):**
```json
{
  "total_vehicles": 3,
  "counts": {
    "car": 2,
    "truck": 1
  },
  "detections": [
    {
      "class": "car",
      "confidence": 0.9421,
      "bbox": [120, 240, 310, 450]
    },
    {
      "class": "car",
      "confidence": 0.8875,
      "bbox": [340, 260, 510, 430]
    },
    {
      "class": "truck",
      "confidence": 0.9124,
      "bbox": [550, 180, 890, 520]
    }
  ],
  "result_image": "/results/4b85c2d1-9d2a-43cf-9f1e-f3b14e912384.jpg"
}
```

---

## 🎯 Model & Detection Classes

VEHIX uses the **YOLOv8 Nano (`yolov8n.pt`)** model optimized for high-speed inference on CPU and GPU devices. The detection pipeline specifically isolates and classifies the following vehicle categories:

| Class | Icon | Color Marker |
| :--- | :---: | :--- |
| **Car** | 🚗 | Cyan (`#06b6d4`) |
| **Bus** | 🚌 | Emerald (`#10b981`) |
| **Truck** | 🚚 | Amber (`#f59e0b`) |
| **Motorcycle** | 🏍️ | Rose (`#f43f5e`) |
| **Bicycle** | 🚲 | Purple (`#8b5cf6`) |

---

## 🛠️ Tech Stack

- **Machine Learning**: [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics), [OpenCV](https://opencv.org/), [NumPy](https://numpy.org/)
- **Backend API**: [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pydantic v2](https://docs.pydantic.dev/)
- **Frontend Framework**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/), [React Icons](https://react-icons.github.io/react-icons/)

---

## 👨‍💻 Author

**Isbandu Rahuman R.**
- AI & Data Science Developer
- Interested in Computer Vision, Machine Learning, and Full-Stack Engineering.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for educational and research use.
