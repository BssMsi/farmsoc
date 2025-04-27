from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, create_engine, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import os

# Create base class for declarative models
Base = declarative_base()

# Define models
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(50), unique=True, nullable=False)  # External user ID
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(user_id='{self.user_id}')>"

class Session(Base):
    __tablename__ = 'sessions'
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(50), unique=True, nullable=False)  # Unique session identifier
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_interaction = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Session(session_id='{self.session_id}')>"

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('sessions.id'), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=True)  # The text content
    
    # Audio specific fields
    audio_file = Column(String(255), nullable=True)  # Path to the audio file
    transcription = Column(Text, nullable=True)  # Transcription from STT
    
    # Performance tracking timestamps (stored as Unix timestamps for efficiency)
    received_at = Column(Integer, nullable=True)  # When the message was received
    stt_completed_at = Column(Integer, nullable=True)  # When speech-to-text completed
    llm_completed_at = Column(Integer, nullable=True)  # When LLM generated the response
    tts_completed_at = Column(Integer, nullable=True)  # When text-to-speech completed
    
    # Relationships
    session = relationship("Session", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(role='{self.role}', content='{self.content[:20]}...')>"

# Database initialization functions
def get_engine(db_path=None):
    if db_path is None:
        # Default location in project directory
        project_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        db_path = os.path.join(project_dir, 'app.db')
    
    return create_engine(f'sqlite:///{db_path}')

def init_db(engine=None):
    """Initialize the database, creating tables if they don't exist."""
    if engine is None:
        engine = get_engine()
    
    Base.metadata.create_all(engine)
    return engine

def get_db_session(engine=None):
    """Get a database session."""
    if engine is None:
        engine = get_engine()
    
    Session = sessionmaker(bind=engine)
    return Session() 