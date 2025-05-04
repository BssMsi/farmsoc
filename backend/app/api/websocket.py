from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict, Optional, Any
import logging
import torch
import tempfile
import os
import io
import magic
from pydub import AudioSegment
from dotenv import load_dotenv
from transformers import pipeline, AutoProcessor, AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, AutoModel, AutoModelForSpeechSeq2Seq

import soundfile as sf
import librosa
import numpy as np
import asyncio
import base64
import json
import requests
import time
import random
import uuid
from transformers import WhisperProcessor, WhisperForConditionalGeneration

from ..database import DBManager

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables (for API keys)
load_dotenv() # Searches for .env file in current dir or parent dirs

# Get Sarvam API key
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
if not SARVAM_API_KEY:
    logger.error("SARVAM_API_KEY not found in environment variables. API functionality will not work.")

# Determine device for pipelines
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
TORCH_DTYPE = torch.bfloat16 if DEVICE == "cuda" and torch.cuda.is_available() and hasattr(torch, 'bfloat16') else torch.float16 # Use bfloat16 if available on CUDA
DEFAULT_SAMPLING_RATE = 16000 # From Shuka example

# Sarvam API endpoints
SARVAM_STT_API_URL = "https://api.sarvam.ai/speech-to-text-translate"
SARVAM_TTS_API_URL = "https://api.sarvam.ai/text-to-speech"
SARVAM_TRANSLATE_API_URL = "https://api.sarvam.ai/translate"

# Create database manager
db_manager = DBManager()

# Ensure audio directory exists
audio_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "audio_files")
os.makedirs(audio_dir, exist_ok=True)

# Reintroduce ConnectionManager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, str] = {}  # Map client_id to session_id

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total clients: {len(self.active_connections)}")

        # Create or get session for this client - use async version to avoid blocking
        session_id, _ = await db_manager.get_or_create_session_async(client_id)
        self.user_sessions[client_id] = session_id
        logger.debug(f"Client {client_id} using session {session_id}")

    def disconnect(self, client_id: str):
         if client_id in self.active_connections:
            del self.active_connections[client_id]
            if client_id in self.user_sessions:
                del self.user_sessions[client_id]
            logger.info(f"Client {client_id} disconnected. Total clients: {len(self.active_connections)}")

    async def send_personal_message(self, message: str | bytes, client_id: str):
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            if isinstance(message, str):
                await websocket.send_text(message)
            elif isinstance(message, bytes):
                await websocket.send_bytes(message)
            # Reduce log verbosity for potentially large messages like audio
            log_preview = message[:100] + "..." if isinstance(message, str) and len(message) > 100 else message

    async def broadcast(self, message: str):
        for client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)
        logger.info(f"Broadcasted: {message[:10]}...")
        
    def get_session_id(self, client_id: str) -> Optional[str]:
        """Get the session ID for a client."""
        return self.user_sessions.get(client_id)
    
    def set_session_id(self, client_id: str, session_id: str):
        """Set the session ID for a client."""
        self.user_sessions[client_id] = session_id

manager = ConnectionManager()

# Router using the manager
router = APIRouter()

async def sarvam_speech_to_text(audio_bytes, client_id: str, session_id: str, prompt="") -> str | None:
    """Convert speech to text using Sarvam.ai API and save audio file"""
    if not SARVAM_API_KEY:
        logger.error("SARVAM_API_KEY not available. Cannot process speech to text.")
        return None
    
    try:
        # Generate a unique filename using user_id, session_id and timestamp
        timestamp = int(time.time())
        audio_filename = f"{client_id}_{session_id}_{timestamp}.wav"
        audio_path = os.path.join(audio_dir, audio_filename)
        
        # Save the audio file
        with open(audio_path, 'wb') as f:
            f.write(audio_bytes)
        
        logger.debug(f"Saved audio file to {audio_path}")
        
        # Prepare API request
        payload = {
            'model': 'saaras:v2',
            'prompt': prompt,
            'with_diarization': False
        }
        
        files = [
            ('file', (audio_filename, open(audio_path, 'rb'), 'audio/wav'))
        ]
        
        headers = {
            'api-subscription-key': SARVAM_API_KEY
        }
        
        # Make API request
        response = await asyncio.to_thread(
            requests.request,
            "POST", 
            SARVAM_STT_API_URL, 
            headers=headers, 
            data=payload, 
            files=files
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.debug(f"Sarvam STT API response: {result}")
            transcription = result.get('transcript', '')
            detected_language_code = result.get('language_code', '')
            # Return both the transcription and the audio filename for storage
            return transcription, audio_filename, detected_language_code
        else:
            logger.error(f"Sarvam STT API error: {response.status_code} - {response.text}")
            return None, audio_filename, None
            
    except Exception as e:
        logger.error(f"Error in Sarvam speech-to-text API: {e}", exc_info=True)
        return None, None, None

# #########################################################

import urllib.parse
from typing import TypedDict, Annotated, List, Optional, Tuple
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_groq import ChatGroq
import os
from copy import deepcopy # To avoid modifying input state directly

# --- Environment Variable for API Key (Recommended) ---
# Ensure you have GROQ_API_KEY set in your environment,
# or replace the default fallback value.
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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") # Replace if needed fallback

# ─────────────────────────────────────────
# 1. Conversation state (Unchanged)
# ─────────────────────────────────────────
class AgentState(TypedDict, total=False):
    messages: List[BaseMessage] # Use simple list for easier manual updates
    intent: str
    product_data: dict
    await_key: Optional[str] # Key we are waiting for an answer to
    done: bool
    summary: str
    url: str # Stores the *latest* generated URL (base or progress or final)
    base_url: str # Stores the base URL determined by intent

# ─────────────────────────────────────────
# 2. One Groq client for everything (Unchanged)
# ─────────────────────────────────────────
llm = ChatGroq(
    model="llama-3.3-70b-versatile", # Using 3.1 as 3.3 might not be available/stable
    api_key=GROQ_API_KEY,
    temperature=0
)
PRODUCT_BASE_URL = "/app/add/product"
POST_BASE_URL = "/app/add/post"

product_fields = [
    ("name",              "What is the product name?"),
    ("category",                 "Which category does it belong to?"),
    ("description","Briefly describe the crop."),
    ("price",             "Price per kg (numbers only)."),
    ("quantity",  "Total quantity produced (numbers only)."),
    ("unit",  "units in")

]

post_fields = [
    ("productId",  "Which existing product do you want to post?"),
    ("content",          "What caption would you like to use?"),
    # ("AdditionalMessage","Any additional message? (or 'none')")
]


# ─────────────────────────────────────────
# 5. Helper: URL Generator (Unchanged)
# ─────────────────────────────────────────
def generate_url(base_url: str, data: dict) -> str:
    """Generates a URL with query parameters from a dictionary."""
    url_prefix = base_url
    query_params = []
    for k, v in data.items():
        if v is not None and str(v).strip(): # Ensure value exists and is not empty string
             # Replace underscore with hyphen for URL key, handle None/empty values
            url_key = urllib.parse.quote_plus(k.replace('_', '-'))
            url_value = urllib.parse.quote_plus(str(v))
            query_params.append(f"{url_key}={url_value}")

    if query_params:
        return f"{url_prefix}?{'&'.join(query_params)}"
    else:
        # Return base URL with '?' only if it doesn't already have one
        return url_prefix if url_prefix.endswith('?') else url_prefix + '?'


# ─────────────────────────────────────────
# 6. The Consolidated Processing Function
# ─────────────────────────────────────────
def process_input_and_generate_url(
    user_input: str,
    current_state: AgentState
) -> Tuple[AgentState, str, str, Optional[str]]:
    """
    Processes user input, updates state, generates URL and AI response.

    Args:
        user_input: The latest text input from the user.
        current_state: The current state of the conversation (AgentState).

    Returns:
        A tuple containing:
        - updated_state: The new state after processing the input.
        - response_message: The AI's response message content.
        - url: The latest generated URL (base, progress, or final).
        - placeholder_name: The key of the next expected input,
                           'SUMMARY' if finished, or None.
    """
    print(f"\n--- Processing Input: '{user_input}' ---")
    # --- State Initialization and Update ---
    # Create a deep copy to avoid modifying the original state dict
    state = deepcopy(current_state)

    # Initialize required fields if they don't exist (e.g., first call)
    if "messages" not in state:
        state["messages"] = []
    if "product_data" not in state:
        state["product_data"] = {}

    # Add the new user message to the history
    state["messages"].append(HumanMessage(content=user_input))

    # Reset 'done' flag if starting a new interaction after completion
    if state.get("done"):
        print("--> Resetting state for new request (detected done=True)")
        state = AgentState(messages=state["messages"]) # Keep history, clear rest

    # --- Local variables ---
    ai_response_content: str = ""
    placeholder_name: Optional[str] = None
    generated_url: str = state.get("url", "") # Carry over previous URL initially

    # --- Intent Classification (if needed) ---
    if not state.get("intent"):
        print("--> Classifying intent...")
        intent_prompt = """
You are an intent classifier for an agricultural marketplace app.
Analyze the user message and classify it as exactly ONE of these intents:

1. "product" - When the user wants to add or create a new product listing
   Examples:
   - "I want to add a new product"
   - "I need to list my wheat crop for sale"
   - "Let me create a product entry for my rice harvest"

2. "post" - When the user wants to create a social post using an existing product
   Examples:
   - "I want to post about my existing product"
   - "I need to advertise the cotton I already listed"
   - "Help me create a post for my listed mangoes"

Return ONLY the word "product" or "post" without any additional text.
"""
        try:
            response = llm.invoke([
                SystemMessage(content=intent_prompt),
                HumanMessage(content=user_input) # Classify based on the *current* input
            ])
            intent = response.content.strip().lower().split()[0] if response.content else ""

            if intent not in ("product", "post"):
                print(f"Warning: Intent '{intent}' not recognized, defaulting to 'product'")
                intent = "product"

            base_url = PRODUCT_BASE_URL if intent == "product" else POST_BASE_URL
            initial_url = base_url + "?" # URL to show initially

            print(f"--> Intent classified as: {intent}")
            print(f"--> Base URL identified: {initial_url}")

            # Update state *after* classification
            state["intent"] = intent
            state["base_url"] = base_url
            state["url"] = initial_url
            state["product_data"] = {} # Reset data for new intent
            state["await_key"] = None
            state["done"] = False
            state["summary"] = None

            # Don't add a separate base URL message, proceed directly to first question
            # generated_url = initial_url # Set generated_url for this turn
            # placeholder_name = None # No specific data awaited yet

        except Exception as e:
            print(f"Error during intent classification: {e}")
            ai_response_content = "Sorry, I couldn't understand your request due to an error. Please try again."
            state["messages"].append(AIMessage(content=ai_response_content))
            return state, ai_response_content, state.get("base_url", "") + "?", None # Return safe defaults

    # --- Form Processing (Runs if intent is now set) ---
    if state.get("intent"):
        intent = state["intent"]
        fields = product_fields if intent == "product" else post_fields
        base_url = state["base_url"]
        data = state["product_data"] # Use the data from the current state

        # --- Check if the current input is an answer to a previous question ---
        key_to_save = state.get("await_key")
        if key_to_save:
            # Assume user_input is the answer to the awaited key
            print(f"--> Saving answer for '{key_to_save}': '{user_input}'")
            data[key_to_save] = user_input.strip()
            state["await_key"] = None # Clear the await key after saving

        # --- Determine next step: Ask next question OR finalize ---
        next_key_to_ask = None
        question_to_ask = None
        for key, q in fields:
            if key not in data: # Find the first key *not* present in data
                next_key_to_ask = key
                question_to_ask = q
                break # Stop at the first unanswered question

        # --- Generate URL based on current data ---
        # This happens *after* potentially saving an answer
        generated_url = generate_url(base_url, data)
        state["url"] = generated_url # Update URL in state

        if next_key_to_ask and question_to_ask:
            # --- Ask the next question ---
            print(f"--> Asking next question for key: '{next_key_to_ask}'")
            msg_content = (
                f"{question_to_ask}\n(please type your answer)\n\n"
                f"Current progress URL: {generated_url}"
            )
            ai_response_content = msg_content
            state["await_key"] = next_key_to_ask # Set key we are waiting for
            state["done"] = False
            placeholder_name = next_key_to_ask
            print(f"--> State: done=False, awaiting='{next_key_to_ask}'")

        else:
            # --- All questions answered → Finalize ---
            if not state.get("done"): # Only finalize once
                print("--> All questions answered. Finalizing.")
                summary_text = summarize(intent, data)
                state["summary"] = summary_text
                # URL already calculated as generated_url with all data

                msg_content = (f"All questions answered! Here is a concise summary:\n\n{summary_text}\n\n"
                               f"Final submission link:\n{generated_url}")
                ai_response_content = msg_content
                state["await_key"] = None # No longer waiting
                state["done"] = True
                placeholder_name = "SUMMARY"
                print(f"--> State: done=True, summary generated.")
            else:
                # If already done, just provide a reminder
                print("--> Already finalized. Reminding user.")
                ai_response_content = ("Looks like we've already completed that request. "
                                       f"The final summary was:\n\n{state['summary']}\n\n"
                                       f"Final URL:\n{generated_url}\n\n"
                                       "You can start a new request or type 'quit'.")
                placeholder_name = "SUMMARY" # Keep indicating it's done

        # Add the AI response message to history
        if ai_response_content:
            state["messages"].append(AIMessage(content=ai_response_content))

    # --- Return the results ---
    print(f"--- Returning State: await='{state.get('await_key')}', done='{state.get('done')}', url='{generated_url}' ---")
    return state, ai_response_content, generated_url, placeholder_name


async def call_english_agent_api(text_input, session_history):
    """
    Call English agent API with the complete conversation history.
    This would be implemented based on the specific agent API details.
    Returns a tuple of (response_text, navigation_url) where navigation_url is optional
    """
    # TODO: Replace with actual English agent API call
    # For now, we'll just echo back the input as a simple response
    try:
        # This is a placeholder - replace with actual API call
        # Here we would pass the entire session_history to the API
        
        conversation_state: AgentState = AgentState(messages=[], product_data={}, done=False)
        updated_state, ai_message, current_url, next_placeholder = process_input_and_generate_url(
                text_input,
                conversation_state
            )

            # Update the state for the next iteration
        conversation_state = updated_state
        return ai_message, current_url
    except Exception as e:
        logger.error(f"Error calling English agent API: {e}", exc_info=True)
        return None, None

async def sarvam_text_to_speech(text, target_lang_code="en-IN") -> str | None:
    """Convert text to speech using Sarvam.ai API"""
    if not SARVAM_API_KEY:
        logger.error("SARVAM_API_KEY not available. Cannot process text to speech.")
        return None
    
    try:
        logger.debug(f"Starting Sarvam.ai text-to-speech API call for {len(text)} characters...")
        
        # Prepare API request
        payload = {
            "inputs": [text],
            "target_language_code": target_lang_code,
            "speech_sample_rate": 8000,
            "enable_preprocessing": True,
            "model": "bulbul:v2"
        }
        
        headers = {
            "Content-Type": "application/json",
            "api-subscription-key": SARVAM_API_KEY
        }
        
        # Make API request
        response = await asyncio.to_thread(
            requests.request,
            "POST", 
            SARVAM_TTS_API_URL, 
            json=payload, 
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.debug(f"Sarvam TTS API call successful to language={target_lang_code}")
            
            # Extract audio data
            if "audios" in result:
                audio_base64 = result["audios"][0]
                return audio_base64
            else:
                logger.error(f"Unexpected TTS response format: {result}")
                return None
        else:
            logger.error(f"Sarvam TTS API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error in Sarvam text-to-speech API: {e}", exc_info=True)
        return None

async def sarvam_translate(text, source_language_code="en-IN", target_language_code="kn-IN") -> str | None:
    """Translate text using Sarvam.ai API"""
    if not SARVAM_API_KEY:
        logger.error("SARVAM_API_KEY not available. Cannot translate text.")
        return text  # Return original text if API key not available
    
    try:
        logger.debug(f"Starting Sarvam.ai translation API call for {len(text)} characters from {source_language_code} to {target_language_code}")
        
        # Prepare API request
        payload = {
            "input": text,
            "source_language_code": source_language_code,
            "target_language_code": target_language_code,
            "speaker_gender": "Female",
            "mode": "formal",
            "model": "mayura:v1",
            "enable_preprocessing": False,
            "output_script": "spoken-form-in-native",
            "numerals_format": "native"
        }
        
        headers = {
            "Content-Type": "application/json",
            "api-subscription-key": SARVAM_API_KEY
        }
        
        # Make API request
        response = await asyncio.to_thread(
            requests.request,
            "POST", 
            SARVAM_TRANSLATE_API_URL, 
            json=payload, 
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.debug(f"Sarvam Translation API call successful")
            
            # Extract translated text
            translated_text = result.get("translated_text")
            if translated_text:
                return translated_text
            else:
                logger.error(f"Unexpected translation response format: {result}")
                return text  # Return original text on unexpected response format
        else:
            logger.error(f"Sarvam Translation API error: {response.status_code} - {response.text}")
            return text  # Return original text on API error
            
    except Exception as e:
        logger.error(f"Error in Sarvam translation API: {e}", exc_info=True)
        return text  # Return original text on exception

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)

    try:
        while True:
            data = await websocket.receive()
            response_text = None
            user_message = None  # The message to store in the database
            session_id = manager.get_session_id(client_id)
            
            # Timestamp when message was received
            received_timestamp = int(time.time())

            target_language_code = "en-IN"
            
            # Check if data contains language parameter
            if isinstance(data, dict) and "language" in data:
                target_language_code = data["language"]
            elif "text" in data and isinstance(data["text"], dict) and "language" in data["text"]:
                target_language_code = data["text"]["language"]
            elif "bytes" in data and isinstance(data["bytes"], dict) and "language" in data["bytes"]:
                target_language_code = data["bytes"]["language"]
                
            logger.debug(f"Using target language code: {target_language_code}")
            
            if not session_id:
                logger.error(f"No session ID for client {client_id}")
                await manager.send_personal_message(json.dumps({"status": "error", "message": "Session not found"}), client_id)
                continue

            if not SARVAM_API_KEY:
                logger.error("SARVAM_API_KEY not available. Cannot process request.")
                await manager.send_personal_message(json.dumps({"status": "error", "message": "AI processing service unavailable."}), client_id)
                continue

            # Get session history for context - use async version to avoid blocking
            session_history = await db_manager.get_session_history_for_llm_async(session_id)
            logger.debug(f"Retrieved history for session {session_id}: {len(session_history)} messages")

            if "text" in data:
                text_data = data["text"]
                logger.debug(f"Received text from {client_id}: {text_data}")
                await manager.send_personal_message(json.dumps({"status": "processing_text", "message": "Processing text request..."}), client_id)

                # For text input, STT is skipped
                stt_completed_timestamp = received_timestamp
                
                # Store user message in database with timestamps in the background
                db_manager.add_user_message_background(
                    session_id, 
                    text_data, 
                    received_at=received_timestamp,
                    stt_completed_at=stt_completed_timestamp
                )
                user_message = text_data
                
                # Call English agent API with the text and session history
                await manager.send_personal_message(json.dumps({"status": "processing_llm", "message": "Thinking..."}), client_id)
                response_text, navigation_url = await call_english_agent_api(text_data, session_history)
                # Timestamp when LLM completed
                llm_completed_timestamp = int(time.time())

            elif "bytes" in data:
                bytes_data = data["bytes"]
                logger.debug(f"Received audio bytes from {client_id}: {len(bytes_data)} bytes")
                await manager.send_personal_message(json.dumps({"status": "processing_audio", "message": "Processing audio..."}), client_id)

                try:
                    # Convert audio format if needed
                    def prepare_audio_data():
                        try:
                            audio_file = io.BytesIO(bytes_data)
                            file_type = magic.from_buffer(bytes_data[:1024])  # Check first 1KB
                            
                            # Handle WebM/Matroska format specifically
                            if 'WebM' in file_type or 'Matroska' in file_type:
                                # Convert using pydub
                                audio = AudioSegment.from_file(audio_file, format="webm")
                                audio = audio.set_frame_rate(DEFAULT_SAMPLING_RATE).set_channels(1)
                                
                                # Convert to WAV format
                                output_buffer = io.BytesIO()
                                audio.export(output_buffer, format="wav")
                                output_buffer.seek(0)
                                return output_buffer.read()
                            
                            # If already in WAV format, return as is
                            return bytes_data
                            
                        except Exception as e:
                            logger.error(f"Error preparing audio: {e}", exc_info=True)
                            raise ValueError(f"Audio preparation failed: {e}")

                    # Prepare audio data for API
                    prepared_audio = await asyncio.to_thread(prepare_audio_data)

                    # Send status update: Processing speech to text
                    await manager.send_personal_message(json.dumps({"status": "processing_stt", "message": "Converting speech to text..."}), client_id)

                    # Call Sarvam STT API and get transcription and audio filename
                    transcribed_text, audio_filename, detected_language_code = await sarvam_speech_to_text(prepared_audio, client_id, session_id)
                    
                    # Timestamp when STT completed
                    stt_completed_timestamp = int(time.time())
                    
                    if not transcribed_text:
                        logger.error(f"Speech-to-text conversion failed for client {client_id}")
                        await manager.send_personal_message(json.dumps({
                            "status": "error",
                            "message": "Failed to convert speech to text."
                        }), client_id)
                        continue
                        
                    logger.debug(f"Transcribed text: {transcribed_text}")

                    # Store user message with audio file reference in the background
                    db_manager.add_user_message_background(
                        session_id, 
                        transcribed_text,
                        audio_file=audio_filename,
                        transcription=transcribed_text,
                        received_at=received_timestamp,
                        stt_completed_at=stt_completed_timestamp
                    )
                    user_message = transcribed_text

                    # Send status update: Processing with LLM
                    await manager.send_personal_message(json.dumps({"status": "processing_llm", "message": "Thinking..."}), client_id)
                    
                    # Call English agent API with the transcribed text and session history
                    response_text, navigation_url = await call_english_agent_api(transcribed_text, session_history)
                    # Timestamp when LLM completed
                    llm_completed_timestamp = int(time.time())

                except Exception as e:
                    logger.error(f"Error processing audio for {client_id}: {e}", exc_info=True)
                    await manager.send_personal_message(json.dumps({"status": "error", "message": f"Error processing audio: {e}"}), client_id)
                    continue # Skip to next message

            # Process assistant response
            if response_text:
                # Unpack response and navigation URL if call_english_agent_api returns a tuple
                # navigation_url = None
                # if isinstance(response_text, tuple) and len(response_text) == 2:
                #     response_text, navigation_url = response_text
                
                # Store original English response
                original_response_text = response_text
                
                # Translate if needed (detected_language_code exists and is not English)
                translation_start_timestamp = None
                translation_completed_timestamp = None
                
                if detected_language_code and detected_language_code != "en-IN":
                    translation_start_timestamp = int(time.time())
                    await manager.send_personal_message(json.dumps({"status": "processing_translation", "message": "Translating response..."}), client_id)
                    translated_text = await sarvam_translate(response_text, "en-IN", detected_language_code)
                    translation_completed_timestamp = int(time.time())
                    if translated_text:
                        response_text = translated_text
                        logger.debug(f"Translated response from English to {detected_language_code}")
                
                # Determine the target language for TTS
                tts_language_code = detected_language_code if detected_language_code else target_language_code
                
                # TTS using Sarvam API
                await manager.send_personal_message(json.dumps({"status": "processing_tts", "message": "Generating audio response..."}), client_id)
                audio_output_base64 = await sarvam_text_to_speech(response_text, target_lang_code=tts_language_code)
                
                # Timestamp when TTS completed
                tts_completed_timestamp = int(time.time())

                # Add assistant response to database with timestamps in the background
                db_manager.add_assistant_message_background(
                    session_id, 
                    original_response_text,  # Store original English response
                    llm_completed_at=llm_completed_timestamp,
                    tts_completed_at=tts_completed_timestamp
                )

                if audio_output_base64:
                    # Calculate and log performance metrics
                    stt_duration = stt_completed_timestamp - received_timestamp if stt_completed_timestamp and received_timestamp else 0
                    llm_duration = llm_completed_timestamp - stt_completed_timestamp if llm_completed_timestamp and stt_completed_timestamp else 0
                    translation_duration = translation_completed_timestamp - translation_start_timestamp if translation_completed_timestamp and translation_start_timestamp else 0
                    tts_duration = tts_completed_timestamp - (translation_completed_timestamp or llm_completed_timestamp) if tts_completed_timestamp else 0
                    total_duration = tts_completed_timestamp - received_timestamp if tts_completed_timestamp and received_timestamp else 0
                    
                    logger.info(f"Performance metrics for {client_id}: STT: {stt_duration}s, LLM: {llm_duration}s, Translation: {translation_duration}s, TTS: {tts_duration}s, Total: {total_duration}s")
                    
                    # Add navigation URL to the response payload if available
                    response_payload = {
                        "status": "response_ready",
                        "text": response_text,
                        "audio_base64": audio_output_base64,
                        "performance": {
                            "stt_duration": stt_duration,
                            "llm_duration": llm_duration,
                            "translation_duration": translation_duration,
                            "tts_duration": tts_duration,
                            "total_duration": total_duration
                        }
                    }
                    
                    # Add navigation_url to the payload if it exists
                    if navigation_url:
                        response_payload["navigation_url"] = navigation_url
                        logger.info(f"Adding navigation URL to response: {navigation_url}")
                    
                    await manager.send_personal_message(json.dumps(response_payload), client_id)
                else:
                    # Include navigation URL in error response if available
                    error_payload = {
                        "status": "error",
                        "message": "Audio generation failed. Displaying text response.",
                        "text": response_text,
                        "performance": {
                            "stt_duration": stt_duration,
                            "llm_duration": llm_duration,
                            "translation_duration": translation_duration,
                            "total_duration": llm_completed_timestamp - received_timestamp if llm_completed_timestamp and received_timestamp else 0
                        }
                    }
                    
                    # Add navigation_url to the error payload if it exists
                    if navigation_url:
                        error_payload["navigation_url"] = navigation_url
                    
                    await manager.send_personal_message(json.dumps(error_payload), client_id)
            else:
                # API failed to return text
                error_message = "AI failed to generate a response."
                logger.error(f"API Error for {client_id}: {error_message}")
                await manager.send_personal_message(json.dumps({"status": "error", "message": error_message}), client_id)

    except WebSocketDisconnect:
        logger.debug(f"WebSocket disconnected for client {client_id}. Cleaning up resources.")
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"Error in WebSocket endpoint for client {client_id}: {e}", exc_info=True)
        # Clean up and disconnect on general errors too
        manager.disconnect(client_id)

# Session management routes
@router.post("/sessions/new")
async def create_new_session(user_id: str):
    """Create a new chat session for a user."""
    try:
        session_id, _ = await db_manager.create_session_async(user_id)
        return {"status": "success", "session_id": session_id}
    except Exception as e:
        logger.error(f"Error creating new session: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

@router.get("/sessions/list")
async def list_sessions(user_id: str):
    """List all sessions for a user."""
    try:
        sessions = await db_manager.get_all_sessions_async(user_id)
        return {"status": "success", "sessions": sessions}
    except Exception as e:
        logger.error(f"Error listing sessions: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

@router.post("/sessions/switch")
async def switch_session(user_id: str, session_id: str):
    """Switch the active session for a user."""
    try:
        success = await db_manager.switch_session_async(user_id, session_id)
        if success:
            # Update the session ID in the connection manager for any active connections
            for client_id, ws in manager.active_connections.items():
                if client_id == user_id:
                    manager.set_session_id(client_id, session_id)
            
            return {"status": "success", "message": f"Switched to session {session_id}"}
        else:
            return {"status": "error", "message": "Failed to switch session"}
    except Exception as e:
        logger.error(f"Error switching session: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

@router.get("/sessions/{session_id}/history")
async def get_session_history(session_id: str):
    """Get the message history for a session."""
    try:
        messages = await db_manager.get_session_messages_async(session_id)
        return {"status": "success", "messages": messages}
    except Exception as e:
        logger.error(f"Error retrieving session history: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

def get_websocket_router():
    return router 