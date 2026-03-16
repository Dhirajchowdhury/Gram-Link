# GramLink AI — Complete Setup & Run Guide

This guide covers every step required to get the project running from scratch on a Windows machine.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [Project Structure](#3-project-structure)
4. [Backend Setup](#4-backend-setup)
5. [Mobile App Setup](#5-mobile-app-setup)
6. [Running the Project](#6-running-the-project)
7. [Accessing the App](#7-accessing-the-app)
8. [API Keys & Configuration](#8-api-keys--configuration)
9. [Common Errors & Fixes](#9-common-errors--fixes)
10. [API Reference](#10-api-reference)

---

## 1. Project Overview

GramLink AI is a full-stack application with two parts:

| Part       | Technology          | Purpose                                        |
| ---------- | ------------------- | ---------------------------------------------- |
| Backend    | Python + FastAPI    | REST API, database, AI/RAG, OCR, SMS OTP       |
| Mobile App | React Native + Expo | Cross-platform mobile UI (Android / iOS / Web) |

The backend runs on `http://localhost:8000` and the mobile app connects to it over your local network.

---

## 2. Prerequisites

Install all of the following before proceeding.

### 2.1 Python 3.8 or higher

Download from https://www.python.org/downloads/

During installation:

- Check "Add Python to PATH"
- Check "Install pip"

Verify installation:

```bash
python --version
pip --version
```

Expected output: `Python 3.x.x` and `pip xx.x`

---

### 2.2 Node.js 16 or higher

Download from https://nodejs.org/en/download (LTS version recommended)

Verify installation:

```bash
node --version
npm --version
```

Expected output: `v18.x.x` or higher, and `9.x.x` or higher

---

### 2.3 Expo Go App (for mobile testing on phone)

- Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- iOS: https://apps.apple.com/app/expo-go/id982107779

> Skip this if you only want to run in the browser.

---

## 3. Project Structure

```
Gram Link AI/
├── backend/                  # Python FastAPI server
│   ├── main.py               # All API routes and app entry point
│   ├── database.py           # SQLite models (users, profiles, applications)
│   ├── rag_service.py        # AI/RAG pipeline using Gemini + ChromaDB
│   ├── requirements.txt      # Full Python dependencies
│   ├── requirements-minimal.txt  # Minimal deps to just boot the server
│   ├── .env                  # Your actual secrets (never commit this)
│   ├── .env.example          # Template for .env
│   ├── ai_mitra.db           # SQLite database (auto-created on first run)
│   ├── chroma_db/            # Vector store for RAG (auto-created)
│   └── venv/                 # Python virtual environment
│
├── mobile/                   # React Native Expo app
│   ├── App.js                # Root component
│   ├── package.json          # Node dependencies
│   └── src/
│       ├── screens/          # All app screens (Login, Home, Profile, etc.)
│       ├── navigation/       # Tab and stack navigation
│       ├── services/
│       │   └── api.js        # API base URL + all HTTP calls to backend
│       ├── utils/
│       │   └── translations.js  # English, Hindi, Bengali strings
│       └── data/
│           └── mockSchemes.js   # Fallback scheme data
│
├── data/
│   └── schemes/
│       └── schemes_database.json  # Government schemes data for RAG
│
├── ml-models/                # Standalone ML scripts (optional)
├── start-backend.bat         # Windows one-click backend starter
├── start-mobile.bat          # Windows one-click mobile starter
└── SETUP_GUIDE.md            # This file
```

---

## 4. Backend Setup

Open a terminal (Command Prompt, PowerShell, or Git Bash) and navigate to the project root.

### Step 1 — Navigate to the backend folder

```bash
cd "Gram Link AI/backend"
```

---

### Step 2 — Create a Python virtual environment

```bash
python -m venv venv
```

This creates a `venv/` folder inside `backend/`. It isolates Python packages for this project.

---

### Step 3 — Activate the virtual environment

**Windows (Command Prompt):**

```cmd
venv\Scripts\activate
```

**Windows (Git Bash / MINGW64):**

```bash
source venv/Scripts/activate
```

**Windows (PowerShell):**

```powershell
venv\Scripts\Activate.ps1
```

After activation, your terminal prompt will show `(venv)` at the start.

---

### Step 4 — Install Python dependencies

**Option A — Minimal install (faster, boots the server without AI/RAG features):**

```bash
pip install -r requirements-minimal.txt
```

**Option B — Full install (includes LangChain, ChromaDB, sentence-transformers for AI features):**

```bash
pip install -r requirements.txt
```

> Full install can take 10–20 minutes due to large packages like `torch` and `chromadb`.
> Use Option A first to verify the server runs, then do Option B later.

---

### Step 5 — Configure environment variables

The `.env` file already exists in `backend/` with working keys. If it's missing, create it:

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
# Google Gemini API key (for AI scheme search)
GEMINI_API_KEY=your_gemini_key_here

# Twilio credentials (for SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Google Vision (for OCR on Aadhaar/PAN)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# JWT auth
JWT_SECRET_KEY=any_long_random_string_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# ChromaDB path
CHROMA_PERSIST_DIR=./chroma_db
```

> The app works without Twilio/Gemini keys — OTP is returned in the API response for testing, and RAG falls back to mock data.

---

### Step 6 — Run the backend server

```bash
python main.py
```

You should see:

```
✅ Database initialized successfully!
⚠️  RAG service initialized (or warning if Gemini key missing)
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

The backend is now live at **http://localhost:8000**

> Keep this terminal open. Do not close it while using the app.

---

## 5. Mobile App Setup

Open a **second terminal** (keep the backend terminal running).

### Step 1 — Navigate to the mobile folder

```bash
cd "Gram Link AI/mobile"
```

---

### Step 2 — Install Node dependencies

```bash
npm install
```

This installs all packages listed in `package.json` into `node_modules/`. Takes 1–3 minutes.

---

### Step 3 — Install web support packages (for browser access)

```bash
npm install react-native-web react-dom @expo/metro-runtime --legacy-peer-deps
```

> Only needed if you want to open the app in a browser. Skip if using Expo Go on phone only.

---

### Step 4 — Update the API URL

Open `mobile/src/services/api.js` and update line 2:

```javascript
// Change this to your computer's local IP address
const API_BASE_URL = "http://YOUR_LOCAL_IP:8000";
```

**How to find your local IP:**

```bash
# Windows
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.9
```

So the line should look like:

```javascript
const API_BASE_URL = "http://192.168.1.9:8000";
```

> If running in browser only (not on a phone), you can use `http://localhost:8000` instead.

---

## 6. Running the Project

### Run Backend

In the `backend/` folder with venv activated:

```bash
python main.py
```

Or using uvicorn directly with auto-reload (useful during development):

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### Run Mobile App

In the `mobile/` folder:

**For browser (web):**

```bash
npx expo start --web --port 19006
```

**For phone (Expo Go app):**

```bash
npx expo start
```

**For Android emulator:**

```bash
npx expo start --android
```

**For iOS simulator (Mac only):**

```bash
npx expo start --ios
```

---

### One-click Windows shortcuts

From the project root, you can also double-click:

- `start-backend.bat` — sets up venv and starts the backend
- `start-mobile.bat` — installs node_modules and starts Expo

---

## 7. Accessing the App

### In the browser

Open: **http://localhost:19006**

---

### On your phone (Expo Go)

1. Make sure your phone and computer are on the **same Wi-Fi network**
2. Run `npx expo start` in the mobile folder
3. A QR code will appear in the terminal
4. Open the **Expo Go** app on your phone
5. Tap "Scan QR Code" and scan it
6. The app will load on your phone

---

### Backend API docs (Swagger UI)

FastAPI auto-generates interactive API documentation:

**http://localhost:8000/docs**

You can test every endpoint directly from the browser here.

**http://localhost:8000/redoc**

Alternative docs in ReDoc format.

---

## 8. API Keys & Configuration

### Google Gemini API (AI scheme search)

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key and paste it as `GEMINI_API_KEY` in `backend/.env`

---

### Twilio (SMS OTP)

1. Sign up at https://www.twilio.com
2. Go to Console → Account Info
3. Copy `Account SID` and `Auth Token`
4. Get a phone number from Twilio
5. Add all three to `backend/.env`

> Without Twilio, OTP is still returned in the API JSON response under `otp_for_testing` — useful for development.

---

### Google Cloud Vision (OCR)

1. Go to https://console.cloud.google.com
2. Create a project and enable the "Cloud Vision API"
3. Create a Service Account and download the JSON credentials file
4. Save it as `backend/google-credentials.json`
5. Set `GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json` in `.env`

> Without this, OCR falls back to the free OCR.space API, and if that also fails, mock data is returned.

---

## 9. Common Errors & Fixes

### `ModuleNotFoundError: No module named 'fastapi'`

The venv is not activated or packages aren't installed.

```bash
# Activate venv first
source venv/Scripts/activate   # Git Bash
# or
venv\Scripts\activate          # CMD

# Then install
pip install -r requirements-minimal.txt
```

---

### `Fatal error in launcher: Unable to create process`

The venv was created on a different machine. Delete it and recreate:

```bash
rm -rf venv
python -m venv venv
source venv/Scripts/activate
pip install -r requirements-minimal.txt
```

---

### `SystemError: pydantic-core version incompatible`

Version conflict between pydantic and pydantic-core:

```bash
pip install "pydantic==2.5.3" "pydantic-core==2.14.6" --force-reinstall
```

---

### `npm expo start` — Unknown command: "expo"

Use `npx` instead of `npm`:

```bash
npx expo start
```

---

### `Port 8081 is being used by another process`

Use a different port:

```bash
npx expo start --web --port 19006
```

---

### App can't connect to backend on phone

- Make sure phone and PC are on the same Wi-Fi
- Update `API_BASE_URL` in `mobile/src/services/api.js` to your PC's local IP (not `localhost`)
- Check Windows Firewall isn't blocking port 8000

---

### `pip install` hangs forever

pip's dependency resolver can hang on large packages. Install with `--no-deps` flag:

```bash
pip install fastapi uvicorn sqlalchemy python-dotenv twilio --no-cache-dir --no-deps
```

---

### RAG / AI search not working

This is expected if langchain/chromadb aren't installed. The app still works — scheme search returns mock data. To enable full AI search, install the full requirements:

```bash
pip install langchain langchain-community langchain-google-genai chromadb sentence-transformers
```

---

## 10. API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint                           | Description                         |
| ------ | ---------------------------------- | ----------------------------------- |
| GET    | `/`                                | Health check                        |
| POST   | `/auth/send-otp`                   | Send OTP to phone number            |
| POST   | `/auth/verify-otp`                 | Verify OTP, returns JWT token       |
| POST   | `/profile/create`                  | Save user profile                   |
| POST   | `/profile/upload-aadhaar`          | OCR extract from Aadhaar card image |
| POST   | `/profile/upload-pan`              | OCR extract from PAN card image     |
| POST   | `/api/query`                       | Natural language scheme search (AI) |
| GET    | `/api/schemes/eligible/{user_id}`  | Get eligible schemes for user       |
| GET    | `/api/schemes/{scheme_id}`         | Get scheme details                  |
| POST   | `/forms/submit`                    | Submit a scheme application         |
| GET    | `/api/user/{user_id}/profile`      | Get user profile                    |
| GET    | `/api/user/{user_id}/applications` | Get user's applications             |

Full interactive docs at: **http://localhost:8000/docs**

---

## Quick Reference — Commands Cheatsheet

```bash
# ── BACKEND ──────────────────────────────────────
cd "Gram Link AI/backend"
python -m venv venv
source venv/Scripts/activate        # Git Bash
pip install -r requirements-minimal.txt
python main.py
# Running at: http://localhost:8000

# ── MOBILE ───────────────────────────────────────
cd "Gram Link AI/mobile"
npm install
npm install react-native-web react-dom @expo/metro-runtime --legacy-peer-deps
npx expo start --web --port 19006
# Running at: http://localhost:19006

# ── API DOCS ─────────────────────────────────────
# http://localhost:8000/docs
```
