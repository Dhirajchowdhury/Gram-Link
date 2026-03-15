from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv
from twilio.rest import Client
from google.cloud import vision
import io
import random
import re
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import json

# Import database
from database import (
    init_db, get_db, 
    get_user_by_phone, create_user, get_user_by_id,
    get_user_profile, create_or_update_profile,
    save_user_query, save_application, get_user_applications
)

load_dotenv()

app = FastAPI(title="GramLink AI API", version="2.0.0")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    # Initialize RAG service
    try:
        from rag_service import initialize_rag
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key and gemini_key != "your_google_key_here":
            schemes_file = os.path.join(os.path.dirname(__file__), "../data/schemes/schemes_database.json")
            initialize_rag(gemini_key, schemes_file)
            print("✅ RAG service initialized with Google Gemini!")
        else:
            print("⚠️  Gemini API key not found. RAG features will be limited.")
    except Exception as e:
        print(f"⚠️  Failed to initialize RAG: {e}")

# CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
GOOGLE_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "default-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# Initialize clients
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Initialize Google Vision client with credentials
if GOOGLE_CREDENTIALS and os.path.exists(GOOGLE_CREDENTIALS):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_CREDENTIALS
    vision_client = vision.ImageAnnotatorClient()
else:
    vision_client = None
    print("Warning: Google Vision credentials not found. OCR will not work.")

# In-memory storage (replace with database later)
otp_storage = {}  # {phone: {"otp": "1234", "expires": datetime}}
user_storage = {}  # {user_id: {profile_data}}

# Helper functions
def parse_aadhaar_text(text: str) -> Dict:
    """Parse Aadhaar card OCR text"""
    data = {
        "name": None,
        "aadhaar_number": None,
        "dob": None,
        "gender": None,
        "address": None
    }
    
    # Extract Aadhaar number (12 digits, may have spaces/dashes)
    aadhaar_pattern = r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'
    aadhaar_match = re.search(aadhaar_pattern, text)
    if aadhaar_match:
        data["aadhaar_number"] = aadhaar_match.group().replace(" ", "").replace("-", "")
    
    # Extract DOB (various formats)
    dob_patterns = [
        r'\b\d{2}[/-]\d{2}[/-]\d{4}\b',
        r'\b\d{2}\s+\w+\s+\d{4}\b'
    ]
    for pattern in dob_patterns:
        dob_match = re.search(pattern, text)
        if dob_match:
            data["dob"] = dob_match.group()
            break
    
    # Extract gender
    if re.search(r'\b(MALE|Male)\b', text):
        data["gender"] = "Male"
    elif re.search(r'\b(FEMALE|Female)\b', text):
        data["gender"] = "Female"
    
    # Extract name (usually after "Name:" or first line with capital letters)
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if 'name' in line.lower() and i + 1 < len(lines):
            data["name"] = lines[i + 1].strip()
            break
        elif re.match(r'^[A-Z][a-z]+ [A-Z][a-z]+', line):
            data["name"] = line.strip()
            break
    
    # Calculate age from DOB if available
    if data["dob"]:
        try:
            # Try to parse DOB and calculate age
            from dateutil import parser
            dob_date = parser.parse(data["dob"])
            age = (datetime.now() - dob_date).days // 365
            data["age"] = age
        except:
            data["age"] = None
    
    return data

def parse_pan_text(text: str) -> Dict:
    """Parse PAN card OCR text"""
    data = {
        "pan_number": None,
        "name": None,
        "father_name": None,
        "dob": None
    }
    
    # Extract PAN number (format: ABCDE1234F)
    pan_pattern = r'\b[A-Z]{5}\d{4}[A-Z]\b'
    pan_match = re.search(pan_pattern, text)
    if pan_match:
        data["pan_number"] = pan_match.group()
    
    # Extract name
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if 'name' in line.lower() and i + 1 < len(lines):
            data["name"] = lines[i + 1].strip()
            break
        elif re.match(r'^[A-Z][a-z]+ [A-Z][a-z]+', line):
            data["name"] = line.strip()
            break
    
    # Extract DOB
    dob_patterns = [
        r'\b\d{2}[/-]\d{2}[/-]\d{4}\b',
        r'\b\d{2}\s+\w+\s+\d{4}\b'
    ]
    for pattern in dob_patterns:
        dob_match = re.search(pattern, text)
        if dob_match:
            data["dob"] = dob_match.group()
            break
    
    return data

# Models
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class ProfileData(BaseModel):
    user_id: Optional[str] = None
    name: str
    age: int
    gender: str
    state: str
    district: str
    occupation: Optional[str] = None
    aadhaar_number: str
    pan_number: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None

class QueryRequest(BaseModel):
    query: str
    language: str = "en"
    user_id: str

class FormData(BaseModel):
    scheme_id: str
    user_id: str
    data: Dict

class CorrectionRequest(BaseModel):
    form_id: str
    correction_text: str
    language: str = "en"

# Routes
@app.get("/")
def root():
    return {"message": "GramLink AI API v2.0", "status": "running"}

@app.post("/auth/send-otp")
async def send_otp(request: OTPRequest):
    """Send OTP to mobile number via Twilio"""
    try:
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Store OTP with 10-minute expiration
        otp_storage[request.phone] = {
            "otp": otp,
            "expires": datetime.now() + timedelta(minutes=10)
        }
        
        # Send OTP via Twilio
        try:
            message = twilio_client.messages.create(
                body=f"Your GramLink AI verification code is: {otp}. Valid for 10 minutes.",
                from_=TWILIO_PHONE_NUMBER,
                to=request.phone
            )
            
            return {
                "success": True,
                "message": "OTP sent successfully",
                "sid": message.sid,
                "otp_for_testing": otp  # Remove this in production!
            }
        except Exception as twilio_error:
            # If Twilio fails, still return success with OTP for testing
            print(f"Twilio error: {twilio_error}")
            return {
                "success": True,
                "message": "OTP generated (SMS failed - check console)",
                "otp_for_testing": otp,
                "error": str(twilio_error)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

@app.post("/auth/verify-otp")
async def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    """Verify OTP and return JWT token"""
    try:
        # Check if OTP exists
        if request.phone not in otp_storage:
            raise HTTPException(status_code=400, detail="OTP not found. Please request a new one.")
        
        stored_data = otp_storage[request.phone]
        
        # Check if OTP expired
        if datetime.now() > stored_data["expires"]:
            del otp_storage[request.phone]
            raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
        
        # Verify OTP
        if stored_data["otp"] != request.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        # Get or create user in database
        user = get_user_by_phone(db, request.phone)
        if not user:
            user_id = f"user_{request.phone.replace('+', '').replace('-', '')}"
            user = create_user(db, user_id, request.phone)
        else:
            user_id = user.user_id
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
        
        # Generate JWT token
        token_data = {
            "user_id": user_id,
            "phone": request.phone,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION)
        }
        token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Clean up OTP
        del otp_storage[request.phone]
        
        return {
            "success": True,
            "token": token,
            "user_id": user_id,
            "message": "Login successful"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.post("/profile/upload-aadhaar")
async def upload_aadhaar(file: UploadFile = File(...)):
    """OCR extract data from Aadhaar card using OCR.space free API"""
    try:
        contents = await file.read()
        ocr_source = "mock"  # Track which OCR method worked
        
        # Try OCR.space free API first
        try:
            import requests
            
            url = 'https://api.ocr.space/parse/image'
            response = requests.post(
                url,
                files={'file': ('aadhaar.jpg', contents, 'image/jpeg')},
                data={
                    'apikey': 'helloworld',  # Free public API key
                    'language': 'eng',
                    'isOverlayRequired': False,
                    'detectOrientation': True,
                    'scale': True,
                    'OCREngine': 2  # Engine 2 is better for documents
                },
                timeout=30
            )
            
            result = response.json()
            
            if not result.get('IsErroredOnProcessing', True) and result.get('ParsedResults'):
                full_text = result['ParsedResults'][0]['ParsedText']
                print(f"✅ OCR.space extracted text: {full_text[:300]}...")
                aadhaar_data = parse_aadhaar_text(full_text)
                
                # Check if we got meaningful data (not just empty fields)
                if aadhaar_data.get('aadhaar_number') or (aadhaar_data.get('name') and len(aadhaar_data.get('name', '')) > 3):
                    print("✅ OCR.space extraction successful - using REAL data!")
                    aadhaar_data['ocr_source'] = 'ocr.space'
                    aadhaar_data['ocr_success'] = True
                    return aadhaar_data
                else:
                    print("⚠️ OCR.space returned empty data")
        except Exception as ocr_error:
            print(f"❌ OCR.space error: {ocr_error}")
        
        # Try Google Vision if available
        if vision_client:
            try:
                image = vision.Image(content=contents)
                response = vision_client.text_detection(image=image)
                texts = response.text_annotations
                
                if texts:
                    full_text = texts[0].description
                    print(f"✅ Google Vision extracted text: {full_text[:300]}...")
                    aadhaar_data = parse_aadhaar_text(full_text)
                    
                    if aadhaar_data.get('aadhaar_number') or aadhaar_data.get('name'):
                        print("✅ Google Vision extraction successful - using REAL data!")
                        aadhaar_data['ocr_source'] = 'google_vision'
                        aadhaar_data['ocr_success'] = True
                        return aadhaar_data
            except Exception as vision_error:
                print(f"❌ Google Vision error: {vision_error}")
        
        # Mock OCR data for testing (when all OCR methods fail)
        print("⚠️ All OCR methods failed - using MOCK data for demo")
        return {
            "name": "Ramesh Kumar",
            "aadhaar_number": "234567891234",
            "dob": "15/08/1978",
            "gender": "Male",
            "age": 46,
            "state": "Bihar",
            "district": "Patna",
            "occupation": "Farmer",
            "address": "Village Rampur, District Patna, Bihar - 800001",
            "ocr_source": "mock",
            "ocr_success": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@app.post("/profile/upload-pan")
async def upload_pan(file: UploadFile = File(...)):
    """OCR extract data from PAN card using OCR.space free API"""
    try:
        contents = await file.read()
        
        # Try OCR.space free API first
        try:
            import requests
            
            url = 'https://api.ocr.space/parse/image'
            response = requests.post(
                url,
                files={'file': ('pan.jpg', contents, 'image/jpeg')},
                data={
                    'apikey': 'helloworld',  # Free public API key
                    'language': 'eng',
                    'isOverlayRequired': False,
                    'detectOrientation': True,
                    'scale': True,
                    'OCREngine': 2
                },
                timeout=30
            )
            
            result = response.json()
            
            if not result.get('IsErroredOnProcessing', True) and result.get('ParsedResults'):
                full_text = result['ParsedResults'][0]['ParsedText']
                print(f"✅ OCR.space extracted PAN text: {full_text[:300]}...")
                pan_data = parse_pan_text(full_text)
                
                # Check if we got meaningful data
                if pan_data.get('pan_number') or (pan_data.get('name') and len(pan_data.get('name', '')) > 3):
                    print("✅ OCR.space PAN extraction successful - using REAL data!")
                    pan_data['ocr_source'] = 'ocr.space'
                    pan_data['ocr_success'] = True
                    return pan_data
                else:
                    print("⚠️ OCR.space returned empty PAN data")
        except Exception as ocr_error:
            print(f"❌ OCR.space error: {ocr_error}")
        
        # Try Google Vision if available
        if vision_client:
            try:
                image = vision.Image(content=contents)
                response = vision_client.text_detection(image=image)
                texts = response.text_annotations
                
                if texts:
                    full_text = texts[0].description
                    print(f"✅ Google Vision extracted PAN text: {full_text[:300]}...")
                    pan_data = parse_pan_text(full_text)
                    
                    if pan_data.get('pan_number') or pan_data.get('name'):
                        print("✅ Google Vision PAN extraction successful - using REAL data!")
                        pan_data['ocr_source'] = 'google_vision'
                        pan_data['ocr_success'] = True
                        return pan_data
            except Exception as vision_error:
                print(f"❌ Google Vision error: {vision_error}")
        
        # Mock OCR data for testing (when all OCR methods fail)
        print("⚠️ All OCR methods failed - using MOCK PAN data for demo")
        return {
            "pan_number": "ABCDE1234F",
            "name": "Ramesh Kumar",
            "dob": "15/08/1978",
            "ocr_source": "mock",
            "ocr_success": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@app.post("/profile/create")
async def create_profile(profile: ProfileData, db: Session = Depends(get_db)):
    """Save user profile to database"""
    try:
        profile_dict = profile.model_dump()
        user_id = profile_dict.get("user_id", "unknown")
        
        # Remove user_id from profile data
        if "user_id" in profile_dict:
            del profile_dict["user_id"]
        
        # Save to database
        db_profile = create_or_update_profile(db, user_id, profile_dict)
        
        return {
            "success": True,
            "user_id": user_id,
            "message": "Profile saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

@app.post("/api/query")
async def query_schemes(request: QueryRequest, db: Session = Depends(get_db)):
    """Natural language query for schemes using RAG"""
    try:
        from rag_service import get_rag_service
        rag = get_rag_service()
        
        if not rag:
            # Fallback to mock data if RAG not initialized
            return {
                "query": request.query,
                "response": "RAG service not initialized. Please check OpenAI API key.",
                "schemes": []
            }
        
        # Get user profile if user_id provided
        user_profile = None
        if request.user_id:
            profile = get_user_profile(db, request.user_id)
            if profile:
                user_profile = {
                    "age": profile.age,
                    "gender": profile.gender,
                    "state": profile.state,
                    "occupation": "Farmer"  # TODO: Add occupation to profile
                }
        
        # Query RAG system with language parameter
        result = rag.query(request.query, user_profile, request.language)
        
        # Save query to database
        save_user_query(
            db,
            request.user_id,
            request.query,
            request.language,
            result['answer'],
            result['schemes_count']
        )
        
        return {
            "query": request.query,
            "response": result['answer'],
            "schemes": result['schemes'],
            "schemes_count": result['schemes_count']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.get("/api/schemes/eligible/{user_id}")
async def get_eligible_schemes(user_id: str, db: Session = Depends(get_db)):
    """Get eligible schemes for user based on their profile"""
    try:
        # Get user profile from database
        profile = get_user_profile(db, user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # TODO: Implement eligibility matching logic (Day 6)
        # For now, return mock schemes
        return {
            "schemes": [
                {"id": "PM-KISAN", "name": "PM-KISAN", "score": 95},
                {"id": "AYUSHMAN", "name": "Ayushman Bharat", "score": 88}
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/schemes/{scheme_id}")
async def get_scheme_details(scheme_id: str):
    """Get full scheme details"""
    try:
        from rag_service import get_rag_service
        rag = get_rag_service()
        
        if rag:
            scheme = rag.get_scheme_by_id(scheme_id)
            if scheme:
                return {"scheme": scheme}
        
        raise HTTPException(status_code=404, detail="Scheme not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), doc_type: str = ""):
    """Upload and extract data from additional documents"""
    # TODO: Implement OCR for various document types
    return {"extracted_data": {}}

@app.post("/forms/autofill")
async def autofill_form(request: FormData):
    """Auto-fill form from user profile and documents"""
    # TODO: Implement field mapping logic
    return {"filled_form": {}}

@app.post("/forms/correct")
async def correct_form(request: CorrectionRequest):
    """Apply voice/text correction to form"""
    # TODO: Implement NLP correction logic
    return {"updated_form": {}, "message": "Correction applied"}

@app.post("/forms/submit")
async def submit_form(request: FormData, db: Session = Depends(get_db)):
    """Submit form online and save to database"""
    try:
        # Save application to database
        application_data_json = json.dumps(request.data)
        application = save_application(
            db,
            request.user_id,
            request.scheme_id,
            request.data.get("scheme_name", "Unknown Scheme"),
            application_data_json
        )
        
        return {
            "success": True,
            "application_id": application.reference_id,
            "message": f"Application submitted successfully! Reference ID: {application.reference_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/forms/pdf/{form_id}")
async def generate_pdf(form_id: str):
    """Generate PDF of filled form"""
    # TODO: Implement PDF generation
    return {"pdf_url": "https://example.com/form.pdf"}

@app.get("/api/user/{user_id}/profile")
async def get_user_profile_api(user_id: str, db: Session = Depends(get_db)):
    """Get user profile"""
    profile = get_user_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "name": profile.name,
        "age": profile.age,
        "gender": profile.gender,
        "state": profile.state,
        "district": profile.district,
        "occupation": profile.occupation,
        "aadhaar_number": profile.aadhaar_number,
        "pan_number": profile.pan_number,
    }

@app.get("/api/user/{user_id}/applications")
async def get_user_applications_api(user_id: str, db: Session = Depends(get_db)):
    """Get all applications for a user"""
    applications = get_user_applications(db, user_id)
    
    return {
        "applications": [
            {
                "id": app.id,
                "scheme_id": app.scheme_id,
                "scheme_name": app.scheme_name,
                "status": app.status,
                "reference_id": app.reference_id,
                "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
            }
            for app in applications
        ]
    }
async def text_to_speech(text: str, language: str = "en"):
    """Convert text to speech"""
    # TODO: Implement TTS
    return {"audio_url": "https://example.com/audio.mp3"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
