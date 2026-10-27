# 🌾 Agro-Haat AI 2.0: Next-Generation Digital Agriculture Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Bhashini AI](https://img.shields.io/badge/Digital%20India-Bhashini%20NLTM-FF9933.svg)](https://bhashini.gov.in/)
[![Agmarknet](https://img.shields.io/badge/Govt%20of%20India-Agmarknet%202.0-blue.svg)](https://agmarknet.gov.in/)
[![License](https://img.shields.io/badge/License-MIT%20Academic-informational.svg)]()

> **Agro-Haat AI 2.0** is an intelligent, multi-layer agricultural decision-support system and digital e-haat marketplace engineered for Indian farmers, agronomists, and consumers. It combines **Digital India Bhashini Multilingual AI Voice Assistant**, **Hybrid Soil-Weather Crop Recommendation Model**, **Location-Aware Soil Health Card (SHC) Generator**, **Real-Time Agmarknet 2.0 Mandi Intelligence**, and **Deep Learning Crop Disease Vision**.

---

## 🌐 Live Deployments & Mobile App

- 🖥️ **Web Platform:** [https://agrohaat-p46g.onrender.com/](https://agrohaat-p46g.onrender.com/)
- 📱 **Mobile App (Expo Go SDK 57):** Native mobile app located in `/mobile` with offline resilience, live mandi ticker, and camera disease diagnosis.
- 📦 **GitHub Repository:** [https://github.com/pranshu2810/AGRO-HAAT](https://github.com/pranshu2810/AGRO-HAAT)

---

## 🌟 Core System Modules & Features

### 1. 🇮🇳 Digital India Bhashini Multilingual AI Voice Assistant
Integrated with the **National Language Translation Mission (NLTM / MeitY)**:
- **12 Indian Languages Supported:**
  - 🇮🇳 हिन्दी (Hindi)
  - 🌾 Hinglish (Conversational)
  - 🇬🇧 English
  - 🇮🇳 ਪੰਜਾਬੀ (Punjabi)
  - 🇮🇳 বাংলা (Bengali)
  - 🇮🇳 मराठी (Marathi)
  - 🇮🇳 ગુજરાતી (Gujarati)
  - 🇮🇳 தமிழ் (Tamil)
  - 🇮🇳 తెలుగు (Telugu)
  - 🇮🇳 ಕನ್ನಡ (Kannada)
  - 🇮🇳 മലയാളം (Malayalam)
  - 🇮🇳 ଓଡ଼ିଆ (Odia)
- **Automatic Indic Script Detection:** Detects Devanagari, Gurmukhi, Bengali, Gujarati, Tamil, Telugu, Kannada, Malayalam, and Odia unicode ranges with lexical dialect classification.
- **Studio-Grade Noise Suppression:** Real-time Web Audio API `AudioContext` and `AnalyserNode` frequency-level filtering eliminating ambient tractor, field, and room noise.
- **Natural Agricultural Spoken Syntax:** Automatic audio phonetizer translating units and currencies (`₹2450/qtl` $\rightarrow$ *"2450 रुपये प्रति क्विंटल"*, `28°C` $\rightarrow$ *"28 डिग्री सेल्सियस"*).
- **Zero Hallucination Grounding:** Voice assistant strictly quotes verified live Agmarknet 2.0 prices and IMD weather data without fabricating figures.
- **Dual-Engine Speech Architecture:** Bhashini IndicWav2Vec ASR & IndicTTS with automatic fallback to Groq Whisper (`whisper-large-v3`) and multi-chunk Indic streaming.

---

### 2. 🌱 Hybrid AI-Driven Crop Recommendation Model
*Based on the research paper: "Hybrid AI-Driven Crop Recommendation Model Based on Soil Nutrient Analysis and Weather-Driven Environmental Factors."*
- **Layer 1 — Soil Nutrient Evaluation:** High-precision evaluation of available Nitrogen (N), Phosphorus (P), Potassium (K), and soil pH against verified agronomic ranges.
- **Layer 2 — Contextual Filtering:** Hard filtering by agro-climatic zone, season (Kharif, Rabi, Zaid), and soil taxonomy (Alluvial, Black, Red, Sandy Loam, Clay Loam).
- **Layer 3 — Real-Time Weather Integration:** Open-Meteo & IMD temperature, relative humidity, and precipitation data.
- **Layer 4 — Regional Profitability & Market Feasibility:** Verifies crop viability against actual regional mandi trends without synthetic market fabrication.
- **Layer 5 — Transparent Decision Explanation:** Provides itemized nutrient-weather match percentages, fertilizer advisories (Urea, DAP, MOP), and irrigation schedules.

---

### 3. 🧪 Location-Aware Soil Health Analysis & Card (SHC) System
- **Dual Geolocation Modes:** Automatic browser GPS with high-accuracy HTML5 Geolocation and reverse geocoding via Nominatim OpenStreetMap; manual hierarchical dropdowns (State $\rightarrow$ District $\rightarrow$ Tehsil/Sub-District $\rightarrow$ Village).
- **Multi-Plot Management:** Farmers can save and switch between distinct plots/farms.
- **Soil Health Card (SHC) Generator:** Generates bilingual (Hindi & English) downloadable soil report cards complying with Indian Ministry of Agriculture standards.

---

### 4. 📊 Agmarknet 2.0 Real-Time Mandi Price Intelligence
- Direct connection to **Agmarknet (Directorate of Marketing & Inspection, Ministry of Agriculture)** and **Data.gov.in**.
- Real-time modal prices, minimum/maximum price boundaries, and arrival quantities per quintal across 28+ states and 2,500+ APMC mandis.
- Historical trend visualization, price alert thresholds, and multi-commodity comparisons.

---

### 5. 🐛 AI Vision Pest & Crop Disease Detection
- Microservice running on **FastAPI** (`http://localhost:8000`).
- Deep Convolutional Neural Network (CNN) diagnosing foliar fungal, bacterial, and viral infections from uploaded crop images.
- Delivers organic remedies, chemical dosages (e.g. Chlorantraniliprole, Emamectin Benzoate, Mancozeb), and preventive agricultural practices.

---

### 6. 🛒 E-Haat Marketplace & Farmer Ecosystem
- **Dual Roles:** Dedicated dashboards for Farmers (manage crops, inventory, live orders, earnings) and Customers (browse fresh produce, add to cart, checkout).
- **Authentication:** Secure session-based authentication with OTP email verification.
- **Cloud Database:** Hosted on MySQL Cloud (Aiven) with connection pooling and automated migration scripts.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Agro-Haat AI 2.0 Client Layer                        │
│   Web (EJS / CSS3 Glassmorphism)  │  Mobile App (React Native / Expo) │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│  Node.js & Express Monolith (Port 3000)│  │ FastAPI ML Microservice (8000)│
│  - Session Auth & Role Access Control │  │ - Deep Learning Disease Vision│
│  - Crop Recommendation Engine        │  │ - Leaf Image Preprocessing   │
│  - Soil Health Card (SHC) Generator  │  └──────────────┬───────────────┘
│  - Bhashini NLTM & Groq Voice Bridge │                 │
│  - Agmarknet 2.0 & Weather Adapters  │                 │
└───────────────────┬──────────────────┘                 │
                    │                                    │
    ┌───────────────┼────────────────────┐               │
    ▼               ▼                    ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│ Aiven MySQL  │ │ Bhashini AI  │ │ Agmarknet   │ │ Open-Meteo   │
│ Cloud DB     │ │ NLTM / MeitY │ │ 2.0 API     │ │ & IMD API    │
└──────────────┘ └──────────────┘ └─────────────┘ └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 Glassmorphism, Bootstrap 5, FontAwesome 6, EJS Templating |
| **Mobile App** | React Native, Expo SDK 57, React Navigation |
| **Backend** | Node.js (v18+), Express.js, Axios, Multer, Express-Session |
| **AI & NLP** | Digital India Bhashini (NLTM / MeitY), Groq AI (`whisper-large-v3`, `qwen3.8-27b`, `gpt-oss-20b`) |
| **Vision ML** | Python 3.10+, FastAPI, PyTorch / TensorFlow, OpenCV, Uvicorn |
| **Database** | MySQL (Aiven Cloud Managed DB) |
| **External APIs**| Agmarknet 2.0 (data.gov.in), Open-Meteo, Nominatim OSM |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [Python](https://www.python.org/) 3.10+ (for ML disease detection service)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/pranshu2810/AGRO-HAAT.git
cd AGRO-HAAT
```

### 2. Configure Environment Variables
Copy the template and configure your credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
SESSION_SECRET=your_secure_session_secret

# Database (MySQL)
DB_HOST=your_mysql_host
DB_PORT=3306
DB_NAME=defaultdb
DB_USER=your_db_user
DB_PASS=your_db_password

# External AI & Language Keys
GROQ_API_KEY=your_groq_api_key
WEATHER_API_KEY=your_weather_api_key

# Digital India Bhashini (Optional - auto falls back to Whisper/Indic Web Speech if omitted)
BHASHINI_USER_ID=your_bhashini_user_id
BHASHINI_API_KEY=your_bhashini_api_key
BHASHINI_INFERENCE_KEY=your_bhashini_inference_key
BHASHINI_PIPELINE_ENDPOINT=https://dhruva-api.bhashini.gov.in/services/inference/pipeline
BHASHINI_AUTH_ENDPOINT=https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline
```

### 3. Install Dependencies & Start Services

#### Backend & Web Platform:
```bash
npm install
node server.js
```
The web application will run at **`http://localhost:3000`**.

#### ML Disease Detection Microservice:
```bash
python -m pip install -r ml_service/requirements.txt
python -m uvicorn ml_service.main:app --host 127.0.0.1 --port 8000
```

#### Mobile Application (Optional):
```bash
cd mobile
npm install
npx expo start -c
```

---

## 🧪 Running the Verification Test Suite

Agro-Haat comes with automated end-to-end integration test suites:

```bash
# Test Bhashini Multilingual & Voice Assistant Integration
node test/test_bhashini_integration.js

# Test Hybrid Crop Recommendation Model & Reference Ranges
node test/test_crop_recommendation.js
```

---

## 👥 Developers & Collaborators

- **Pranshu Gupta** — [GitHub (@pranshu2810)](https://github.com/pranshu2810)
- **Neeraj Sahni** — [GitHub (@Neeraj-Sahni)](https://github.com/Neeraj-Sahni)
- **Parv** — [GitHub (@parv-byte)](https://github.com/parv-byte)

*Department of Computer Science & Engineering*  
*Noida Institute of Engineering and Technology (NIET), Greater Noida*

---

## 📜 License
This project is licensed for academic, demonstration, and research purposes.
