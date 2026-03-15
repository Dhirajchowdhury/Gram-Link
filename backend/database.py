"""
Database models and connection for AI-Mitra
Using SQLAlchemy with SQLite
"""
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_mitra.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    state = Column(String)
    district = Column(String)
    occupation = Column(String, nullable=True)
    aadhaar_number = Column(String)
    pan_number = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SchemeApplication(Base):
    __tablename__ = "scheme_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    scheme_id = Column(String)
    scheme_name = Column(String)
    application_data = Column(Text)  # JSON string
    status = Column(String, default="draft")  # draft, submitted, approved, rejected
    reference_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)

class UserQuery(Base):
    __tablename__ = "user_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    query_text = Column(Text)
    language = Column(String, default="en")
    response = Column(Text, nullable=True)
    schemes_found = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database helper functions
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully!")

def get_user_by_phone(db, phone: str):
    """Get user by phone number"""
    return db.query(User).filter(User.phone == phone).first()

def get_user_by_id(db, user_id: str):
    """Get user by user_id"""
    return db.query(User).filter(User.user_id == user_id).first()

def create_user(db, user_id: str, phone: str):
    """Create new user"""
    user = User(user_id=user_id, phone=phone)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_profile(db, user_id: str):
    """Get user profile"""
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

def create_or_update_profile(db, user_id: str, profile_data: dict):
    """Create or update user profile"""
    profile = get_user_profile(db, user_id)
    
    if profile:
        # Update existing profile
        for key, value in profile_data.items():
            setattr(profile, key, value)
        profile.updated_at = datetime.utcnow()
    else:
        # Create new profile
        profile = UserProfile(user_id=user_id, **profile_data)
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    return profile

def save_user_query(db, user_id: str, query_text: str, language: str, response: str, schemes_count: int):
    """Save user query to database"""
    query = UserQuery(
        user_id=user_id,
        query_text=query_text,
        language=language,
        response=response,
        schemes_found=schemes_count
    )
    db.add(query)
    db.commit()
    return query

def save_application(db, user_id: str, scheme_id: str, scheme_name: str, application_data: str):
    """Save scheme application"""
    application = SchemeApplication(
        user_id=user_id,
        scheme_id=scheme_id,
        scheme_name=scheme_name,
        application_data=application_data,
        status="submitted",
        submitted_at=datetime.utcnow(),
        reference_id=f"APP{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

def get_user_applications(db, user_id: str):
    """Get all applications for a user"""
    return db.query(SchemeApplication).filter(SchemeApplication.user_id == user_id).all()
