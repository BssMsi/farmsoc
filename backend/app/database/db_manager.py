from typing import List, Dict, Optional, Tuple
import logging
import uuid
import datetime
import asyncio
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import desc
import sqlalchemy.exc

from .models import User, Session, Message, get_db_session, init_db

logger = logging.getLogger(__name__)

class DBManager:
    """Manager class for database operations related to chat sessions."""
    
    def __init__(self):
        """Initialize the database manager."""
        self.engine = init_db()
        self.db = get_db_session(self.engine)
    
    def close(self):
        """Close the database session."""
        try:
            self.db.close()
        except sqlalchemy.exc.InvalidRequestError as e:
            logger.error(f"Error closing session: {e}")
            try:
                self.db.rollback()
                self.db.close()
            except Exception as ex:
                logger.error(f"Failed to rollback and close: {ex}")
    
    def _ensure_valid_session(self):
        """Ensure the database session is in a valid state."""
        try:
            # Test if session is valid
            from sqlalchemy import text
            self.db.execute(text('SELECT 1'))
        except sqlalchemy.exc.InvalidRequestError as e:
            logger.warning(f"Invalid session state detected: {e}")
            try:
                # Try to rollback any pending transactions
                self.db.rollback()
                logger.info("Successfully rolled back transaction")
            except Exception as rollback_error:
                logger.error(f"Failed to rollback: {rollback_error}")
                # Create a new session as a last resort
                self.db.close()
                self.db = get_db_session(self.engine)
                logger.info("Created new database session")
                
    async def close_async(self):
        """Close the database session asynchronously."""
        await asyncio.to_thread(self.close)
    
    def get_or_create_user(self, user_id: str) -> User:
        """Get a user by ID or create if it doesn't exist."""
        self._ensure_valid_session()
        
        user = self.db.query(User).filter(User.user_id == user_id).first()
        if not user:
            user = User(user_id=user_id)
            self.db.add(user)
            try:
                self.db.commit()
                logger.info(f"Created new user with ID: {user_id}")
            except Exception as e:
                logger.error(f"Error creating user: {e}")
                self.db.rollback()
                raise
        return user
    
    async def get_or_create_user_async(self, user_id: str) -> User:
        """Get a user by ID or create if it doesn't exist (async version)."""
        return await asyncio.to_thread(self.get_or_create_user, user_id)
    
    def create_session(self, user_id: str) -> Tuple[str, int]:
        """Create a new session for a user."""
        self._ensure_valid_session()
        
        user = self.get_or_create_user(user_id)
        
        # Generate a unique session ID
        session_id = str(uuid.uuid4())
        
        # Create the session
        session = Session(session_id=session_id, user_id=user.id)
        self.db.add(session)
        try:
            self.db.commit()
            
            # Add system message to initialize the conversation
            system_msg = Message(
                session_id=session.id,
                role="system",
                content="You are FarmSocial AI, a helpful assistant for Kannada-speaking farmers. Respond naturally and informatively in Kannada based on the user's voice or text input."
            )
            self.db.add(system_msg)
            self.db.commit()
            
            logger.info(f"Created new session {session_id} for user {user_id}")
            return session_id, session.id
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            self.db.rollback()
            raise
    
    async def create_session_async(self, user_id: str) -> Tuple[str, int]:
        """Create a new session for a user (async version)."""
        return await asyncio.to_thread(self.create_session, user_id)
    
    def get_active_session(self, user_id: str) -> Optional[Tuple[str, int]]:
        """Get the active session for a user."""
        self._ensure_valid_session()
        
        user = self.get_or_create_user(user_id)
        session = self.db.query(Session).filter(
            Session.user_id == user.id,
            Session.is_active == True
        ).order_by(desc(Session.last_interaction)).first()
        
        if session:
            return session.session_id, session.id
        return None
    
    async def get_active_session_async(self, user_id: str) -> Optional[Tuple[str, int]]:
        """Get the active session for a user (async version)."""
        return await asyncio.to_thread(self.get_active_session, user_id)
    
    def get_or_create_session(self, user_id: str) -> Tuple[str, int]:
        """Get the active session for a user or create a new one."""
        self._ensure_valid_session()
        
        active_session = self.get_active_session(user_id)
        if active_session:
            return active_session
        return self.create_session(user_id)
    
    async def get_or_create_session_async(self, user_id: str) -> Tuple[str, int]:
        """Get the active session for a user or create a new one (async version)."""
        return await asyncio.to_thread(self.get_or_create_session, user_id)
    
    def get_all_sessions(self, user_id: str) -> List[Dict]:
        """Get all sessions for a user."""
        user = self.get_or_create_user(user_id)
        sessions = self.db.query(Session).filter(Session.user_id == user.id).all()
        
        return [
            {
                "session_id": session.session_id,
                "created_at": session.created_at,
                "last_interaction": session.last_interaction,
                "is_active": session.is_active
            }
            for session in sessions
        ]
    
    async def get_all_sessions_async(self, user_id: str) -> List[Dict]:
        """Get all sessions for a user (async version)."""
        return await asyncio.to_thread(self.get_all_sessions, user_id)
    
    def get_session_by_id(self, session_id: str) -> Optional[Session]:
        """Get a session by its string ID."""
        return self.db.query(Session).filter(Session.session_id == session_id).first()
    
    async def get_session_by_id_async(self, session_id: str) -> Optional[Session]:
        """Get a session by its string ID (async version)."""
        return await asyncio.to_thread(self.get_session_by_id, session_id)
    
    def get_session_messages(self, session_id: str) -> List[Dict]:
        """Get all messages for a session."""
        session = self.get_session_by_id(session_id)
        if not session:
            return []
        
        messages = self.db.query(Message).filter(Message.session_id == session.id).order_by(Message.timestamp).all()
        
        return [
            {
                "role": message.role,
                "content": message.content,
                "timestamp": message.timestamp,
                "audio_file": message.audio_file,
                "transcription": message.transcription
            }
            for message in messages
        ]
    
    async def get_session_messages_async(self, session_id: str) -> List[Dict]:
        """Get all messages for a session (async version)."""
        return await asyncio.to_thread(self.get_session_messages, session_id)
    
    def get_session_history_for_llm(self, session_id: str) -> List[Dict[str, str]]:
        """Get the session history in a format suitable for the LLM."""
        session = self.get_session_by_id(session_id)
        if not session:
            return []
        
        messages = self.db.query(Message).filter(Message.session_id == session.id).order_by(Message.timestamp).all()
        
        return [
            {"role": message.role, "content": message.content}
            for message in messages
        ]
    
    async def get_session_history_for_llm_async(self, session_id: str) -> List[Dict[str, str]]:
        """Get the session history in a format suitable for the LLM (async version)."""
        return await asyncio.to_thread(self.get_session_history_for_llm, session_id)
    
    def add_user_message(self, session_id: str, content: str, audio_file: Optional[str] = None, 
                       transcription: Optional[str] = None, received_at: Optional[int] = None,
                       stt_completed_at: Optional[int] = None) -> Message:
        """Add a user message to a session with performance tracking timestamps."""
        session = self.get_session_by_id(session_id)
        if not session:
            logger.error(f"Session {session_id} not found")
            return None
        
        # Update session's last interaction time
        session.last_interaction = datetime.datetime.utcnow()
        
        # Create and add the message
        message = Message(
            session_id=session.id,
            role="user",
            content=content,
            audio_file=audio_file,
            transcription=transcription,
            received_at=received_at,
            stt_completed_at=stt_completed_at
        )
        self.db.add(message)
        self.db.commit()
        
        return message
    
    def add_user_message_background(self, session_id: str, content: str, audio_file: Optional[str] = None, 
                              transcription: Optional[str] = None, received_at: Optional[int] = None,
                              stt_completed_at: Optional[int] = None):
        """Add a user message to a session in the background without waiting for completion."""
        # Start the database operation in a thread but don't block
        # Fire and forget to prevent blocking the main flow
        asyncio.create_task(
            asyncio.to_thread(
                self.add_user_message, 
                session_id, 
                content, 
                audio_file, 
                transcription, 
                received_at, 
                stt_completed_at
            )
        )
        return None  # We don't wait for the result
    
    def add_assistant_message(self, session_id: str, content: str, 
                           llm_completed_at: Optional[int] = None,
                           tts_completed_at: Optional[int] = None) -> Message:
        """Add an assistant message to a session with performance tracking timestamps."""
        session = self.get_session_by_id(session_id)
        if not session:
            logger.error(f"Session {session_id} not found")
            return None
        
        # Update session's last interaction time
        session.last_interaction = datetime.datetime.utcnow()
        
        # Create and add the message
        message = Message(
            session_id=session.id,
            role="assistant",
            content=content,
            llm_completed_at=llm_completed_at,
            tts_completed_at=tts_completed_at
        )
        self.db.add(message)
        self.db.commit()
        
        return message
    
    def add_assistant_message_background(self, session_id: str, content: str, 
                                  llm_completed_at: Optional[int] = None,
                                  tts_completed_at: Optional[int] = None):
        """Add an assistant message to a session in the background without waiting for completion."""
        # Start the database operation in a thread but don't block
        # Fire and forget to prevent blocking the main flow
        asyncio.create_task(
            asyncio.to_thread(
                self.add_assistant_message, 
                session_id, 
                content, 
                llm_completed_at, 
                tts_completed_at
            )
        )
        return None  # We don't wait for the result
    
    def switch_session(self, user_id: str, new_session_id: str) -> bool:
        """Switch the active session for a user."""
        user = self.get_or_create_user(user_id)
        
        # Deactivate all current sessions
        active_sessions = self.db.query(Session).filter(
            Session.user_id == user.id,
            Session.is_active == True
        ).all()
        
        for session in active_sessions:
            session.is_active = False
        
        # Activate the new session
        new_session = self.db.query(Session).filter(
            Session.user_id == user.id,
            Session.session_id == new_session_id
        ).first()
        
        if new_session:
            new_session.is_active = True
            new_session.last_interaction = datetime.datetime.utcnow()
            self.db.commit()
            return True
        
        self.db.commit()
        return False
        
    async def switch_session_async(self, user_id: str, new_session_id: str) -> bool:
        """Switch the active session for a user (async version)."""
        return await asyncio.to_thread(self.switch_session, user_id, new_session_id)
    
    def _safe_commit(self):
        """Safely commit changes with rollback on error."""
        try:
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error during commit: {e}")
            self.db.rollback()
            return False 