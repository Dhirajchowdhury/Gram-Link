# GramLink AI

A multilingual AI-powered mobile application that helps rural citizens discover and apply for government schemes in India.

## 🎯 Overview

GramLink AI simplifies access to government welfare schemes by providing:

- **Multilingual Support**: English, Hindi, and Bengali
- **AI-Powered Search**: Natural language queries using Google Gemini
- **Smart Recommendations**: Personalized scheme suggestions based on user profile
- **Document Processing**: OCR extraction from Aadhaar and PAN cards
- **Easy Application**: Guided application process with form assistance

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Expo CLI
- Mobile device or emulator

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Mobile App Setup

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go app on your phone.

## 📱 Features

- **OTP Authentication**: Secure login via Twilio SMS
- **Profile Setup**: Extract data from documents using OCR
- **AI Search**: Ask questions in natural language
- **Scheme Discovery**: Browse 10+ government schemes
- **Category Filtering**: Find schemes by category
- **Application Tracking**: Monitor application status
- **Multilingual UI**: Switch between languages seamlessly

## 🛠️ Technology Stack

See [TECHNOLOGY_STACK.md](TECHNOLOGY_STACK.md) for detailed information.

### Frontend

- React Native + Expo SDK 50
- React Navigation
- React Native Paper

### Backend

- FastAPI
- SQLite
- SQLAlchemy

### AI/ML

- Google Gemini API
- LangChain
- ChromaDB
- HuggingFace Embeddings

### Services

- Twilio (SMS OTP)
- OCR.space (Document OCR)
- DiceBear (AI Avatars)

## 📂 Project Structure

```
GramLink-AI/
├── mobile/              # React Native mobile app
│   ├── src/
│   │   ├── screens/    # App screens
│   │   ├── navigation/ # Navigation setup
│   │   ├── services/   # API services
│   │   └── utils/      # Utilities (translations, etc.)
│   └── App.js
├── backend/            # FastAPI backend
│   ├── main.py        # API endpoints
│   ├── database.py    # Database models
│   ├── rag_service.py # RAG pipeline
│   └── requirements.txt
├── data/              # Scheme data
│   └── schemes/
│       └── schemes_database.json
└── ml-models/         # ML pipelines (future)
```

## 🔑 Configuration

### Backend (.env)

```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
GEMINI_API_KEY=your_gemini_key
```

### Mobile (api.js)

Update the IP address to your computer's local IP:

```javascript
const API_BASE_URL = "http://YOUR_IP:8000";
```

## 📊 Database Schema

- **users**: User accounts and authentication
- **user_profiles**: User demographic information
- **scheme_applications**: Application tracking
- **user_queries**: Search history

## 🎨 Screenshots

The app features a modern green-themed UI with:

- Onboarding screens
- Profile setup with OCR
- AI-powered search
- Scheme browsing by category
- Application tracking
- User profile with AI avatar

## 🔮 Future Enhancements

- Voice input/output
- Advanced OCR with preprocessing
- Push notifications
- PDF generation
- Payment integration
- Location-based recommendations
- Social sharing

## 📄 License

This project is part of a hackathon submission.

## 👥 Team

Built for rural empowerment and digital inclusion.

---

**Note**: This is a prototype application. Some features use mock data for demonstration purposes.
