# 🚗 VEHIX — Intelligent Vehicle Detection System

> **AI-powered vehicle detection, classification, counting, and visual analysis using computer vision.**

VEHIX is an AI-based computer vision system designed to detect and analyze vehicles from images. It uses **YOLO-based object detection** to identify vehicles, classify them, count detected objects, and generate an annotated version of the input image.

The project combines an **AI detection engine**, **FastAPI backend**, and a modern web interface to create an interactive vehicle analysis platform.

---

## ✨ Features

* 🚘 Vehicle detection using YOLO
* 🔍 Object classification
* 🔢 Automatic vehicle counting
* 🖼️ Annotated detection images
* 📊 Detection results dashboard
* 📦 JSON-based API responses
* ⚡ FastAPI backend
* 🌐 Modern web interface
* 📤 Image upload and processing
* 🤖 Computer vision powered analysis

---

## 🧠 How It Works

```text
Upload Vehicle Image
        ↓
    FastAPI Backend
        ↓
     YOLO Model
        ↓
 Object Detection
        ↓
┌───────────────────────┐
│ Vehicle Classification│
│ Vehicle Counting      │
│ Bounding Boxes        │
└───────────────────────┘
        ↓
Annotated Image + JSON
        ↓
   Web Dashboard
```

---

## 🛠️ Tech Stack

### AI / Computer Vision

* Python
* YOLO
* OpenCV
* NumPy

### Backend

* FastAPI
* Uvicorn
* REST API

### Frontend

* Vite
* JavaScript
* Tailwind CSS

---

## 📂 Project Structure

```text
VEHIX/
│
├── backend/
│   ├── main.py
│   ├── models/
│   ├── services/
│   ├── uploads/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd VEHIX
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

### 3. Activate the Environment

Windows:

```bash
venv\Scripts\activate
```

Linux / macOS:

```bash
source venv/bin/activate
```

### 4. Install Backend Dependencies

```bash
pip install -r backend/requirements.txt
```

### 5. Start the Backend

```bash
uvicorn backend.main:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 🌐 Run the Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## 📸 Detection Pipeline

VEHIX processes an image through the following pipeline:

```text
INPUT IMAGE
     ↓
Image Preprocessing
     ↓
YOLO Detection
     ↓
Bounding Box Generation
     ↓
Object Classification
     ↓
Vehicle Counting
     ↓
Confidence Analysis
     ↓
Annotated Image
     ↓
JSON Results
```

---

## 📊 Example Output

VEHIX can return information such as:

```json
{
  "total_vehicles": 5,
  "detections": [
    {
      "class": "car",
      "confidence": 0.94
    },
    {
      "class": "bus",
      "confidence": 0.89
    },
    {
      "class": "motorcycle",
      "confidence": 0.91
    }
  ]
}
```

The system can also generate an annotated image containing bounding boxes around detected vehicles.

---

## 🎯 Use Cases

VEHIX can be extended for:

* 🚦 Traffic monitoring
* 🛣️ Road surveillance
* 🚘 Vehicle counting
* 🅿️ Parking analysis
* 📹 CCTV analysis
* 🚧 Smart-city applications
* 📈 Traffic data analytics
* 🤖 Autonomous driving research

---

## 🔮 Future Improvements

* Real-time webcam detection
* Video vehicle tracking
* License plate detection
* Vehicle speed estimation
* Traffic density analysis
* Multi-camera monitoring
* Vehicle history and analytics
* Database integration
* Real-time detection dashboard
* Cloud deployment

---

## 📈 Project Goal

The goal of VEHIX is to explore how **AI and computer vision can transform visual road data into useful, structured information**.

Instead of simply detecting an object, VEHIX focuses on turning detection results into an interactive analysis experience.

---

## 👨‍💻 Developer

**Isbandu Rahuman R.**

AI & Data Science Student
Interested in **AI/ML, Computer Vision, Full-Stack Development & Cybersecurity**

---

## ⭐ Project Status

**Active Development**

VEHIX is an experimental computer-vision project and is continuously being improved with new detection and analytics capabilities.

---

## 📜 License

This project is intended for educational and research purposes.
