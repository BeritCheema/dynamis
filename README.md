# Dynamis

> **Unlock your athletic potential through AI-powered motion analysis and intelligent feedback.**

---

## Overview

**Dynamis** is a real-time sports training platform that captures an athlete's movement, analyzes key biomechanical features, and delivers AI-generated coaching feedback to optimize performance, form, and injury prevention.

Leveraging computer vision, real-time data processing, and large language models (LLMs), Dynamis helps athletes train smarter — unlocking the full power of their motion.

---

## Key Features

- 📷 **Real-Time Pose Tracking** — Capture body landmarks using a standard camera.
- 📊 **Movement Feature Extraction** — Analyze joint angles, stability, and motion dynamics.
- 🧠 **AI Feedback Generation** — Use LLMs to interpret performance and recommend improvements.
- 🔊 **Dynamic Speech Coaching** — Deliver coaching advice through AI-generated audio.
- ⚡ **Multi-Sport Flexibility** — Built to adapt across different sports and training activities.

---

## Technology Stack

| Frontend | Backend | AI / Data Processing |
|:---|:---|:---|
| React (Vite) | FastAPI (Python) | Google Gemini (LLM) |
| Tailwind CSS | Uvicorn | OpenAI TTS (Text-to-Speech) |
| Mediapipe Pose | Python-dotenv | Motion Feature Engineering |

---

## Architecture

- **Frontend (Vite + React):**
  - Captures video stream and extracts body pose landmarks.
  - Sends batches of movement frames to backend for analysis.
  - Plays AI-generated audio feedback to the user.

- **Backend (FastAPI):**
  - Processes real-time pose data and extracts key athletic features.
  - Summarizes movement metrics (e.g., elbow extension, wrist snap, hip stability).
  - Sends feature summaries to LLM for evaluation.
  - Returns a coaching feedback message to frontend.

- **AI Layer:**
  - Google Gemini interprets biomechanical summaries.
  - OpenAI TTS converts feedback into dynamic spoken advice.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/beritcheema/dynamis.git
cd dynamis
```

---

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file inside `/backend/`:

```env
GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_tts_api_key
```

Start the backend server:

```bash
uvicorn main:app --reload --port 8000
```

---

### 3. Frontend Setup

```bash
cd ../
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`.

---

# Dynamis

**Train Smarter. Move Better. Unlock Your Potential.**
