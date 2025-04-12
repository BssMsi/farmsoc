from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import logging
import torch
import tempfile
import os
import io
from dotenv import load_dotenv
from transformers import pipeline
import soundfile as sf
import librosa
import numpy as np
import asyncio
import base64
import json
import requests

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables (for API keys)
load_dotenv() # Searches for .env file in current dir or parent dirs

# Determine device for pipelines
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
TORCH_DTYPE = torch.bfloat16 if DEVICE == "cuda" and torch.cuda.is_available() and hasattr(torch, 'bfloat16') else torch.float32 # Use bfloat16 if available on CUDA
DEFAULT_SAMPLING_RATE = 16000 # From Shuka example

# --- Hugging Face & TTS Configuration ---
load_dotenv() # Ensure .env is loaded
hf_token = os.getenv("HUGGING_FACE_HUB_TOKEN")
sarvam_api_key = os.getenv("SARVAM_API_KEY") # Get Sarvam API Key
SARVAM_STT_API_ENDPOINT = os.getenv("SARVAM_STT_API_ENDPOINT", "https://api.sarvam.ai/v1/voice/stt") # Get endpoint or use placeholder

# Check if HF token is loaded
if not hf_token:
    logger.warning("HUGGING_FACE_HUB_TOKEN not found in environment variables. LLM/TTS functionality might be limited or disabled.")
    # Depending on the model, the Inference Client might work for some free models without a token, but rate limits will apply.

# Check if Sarvam key is loaded
if not sarvam_api_key:
    logger.warning("SARVAM_API_KEY not found in environment variables. Shuka STT functionality will be disabled.")

# TTS Model (Kannada)
TTS_MODEL_ID = "facebook/mms-tts-kan"
logger.info(f"Initializing TTS pipeline for model '{TTS_MODEL_ID}' on device '{DEVICE}'...")
try:
    # Initialize the pipeline.
    tts_pipeline = pipeline("text-to-speech", model=TTS_MODEL_ID, device=DEVICE if DEVICE == "cpu" else 0, torch_dtype=TORCH_DTYPE)
    logger.info(f"TTS pipeline for '{TTS_MODEL_ID}' initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize TTS pipeline for '{TTS_MODEL_ID}': {e}")
    tts_pipeline = None # Indicate pipeline initialization failed
    # TODO: Add user-facing error message propagation if pipeline fails crucial init

# --- Shuka Audio-Text-to-Text Pipeline Configuration ---
SHUKA_MODEL_ID = "sarvamai/shuka-1"
logger.info(f"Initializing main Shuka pipeline for model '{SHUKA_MODEL_ID}' on device '{DEVICE}' with dtype '{TORCH_DTYPE}'...")
try:
    # Initialize the single pipeline for Shuka
    shuka_pipeline = pipeline(
        model=SHUKA_MODEL_ID,
        device=DEVICE if DEVICE == "cpu" else 0,
        torch_dtype=TORCH_DTYPE,
        trust_remote_code=True,
        token=hf_token # Pass token if model is private/gated
    )
    logger.info(f"Shuka pipeline for '{SHUKA_MODEL_ID}' initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Shuka pipeline for '{SHUKA_MODEL_ID}': {e}", exc_info=True)
    shuka_pipeline = None # Indicate pipeline initialization failed
    # TODO: Add user-facing error message propagation if pipeline fails crucial init

# Reintroduce ConnectionManager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, client_id: str):
         if client_id in self.active_connections:
            del self.active_connections[client_id]
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
            logger.info(f"Sent to {client_id}: {type(message)} ({len(message)} bytes/chars) Preview: {log_preview}")

    async def broadcast(self, message: str):
        for client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)
        logger.info(f"Broadcasted: {message[:50]}...")

manager = ConnectionManager()

# Router using the manager
router = APIRouter()

# Placeholder for conversation history (simple example)
# TODO: Implement proper session management for history (e.g., Redis, DB)
# TODO: Add unique interaction IDs to track requests/responses better
conversation_history: Dict[str, List[Dict[str, str]]] = {}

async def get_tts_audio(text: str) -> str | None:
    """Synthesizes audio from text using the MMS-TTS model via pipeline and returns base64 encoded WAV."""
    if not tts_pipeline:
        logger.warning("TTS pipeline not initialized. Skipping TTS.")
        return None

    try:
        logger.info(f"Starting TTS synthesis via pipeline for text: {text[:50]}...")

        # Run pipeline inference in a separate thread
        synthesis_output = await asyncio.to_thread(tts_pipeline, text)

        waveform = synthesis_output["audio"]
        samplerate = synthesis_output["sampling_rate"]

        logger.info(f"TTS synthesis successful. Waveform shape: {waveform.shape}, Sample rate: {samplerate}")

        # Ensure waveform is 1D for soundfile if it's 2D mono
        if waveform.ndim == 2 and waveform.shape[0] == 1:
            waveform = waveform.squeeze(0)
            # logger.info(f"Reshaped waveform to {waveform.shape}") # Less verbose logging

        # Use soundfile to write to a bytes buffer
        audio_buffer = io.BytesIO()
        # Use await asyncio.to_thread for the blocking sf.write call
        await asyncio.to_thread(sf.write, audio_buffer, waveform, samplerate, format='WAV', subtype='PCM_16')
        audio_bytes = audio_buffer.getvalue()

        # Encode audio bytes to base64 string
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        logger.info(f"Generated TTS audio: {len(audio_bytes)} bytes, encoded to {len(audio_base64)} base64 chars")
        return audio_base64

    except Exception as e:
        logger.error(f"Error during TTS synthesis pipeline: {e}", exc_info=True) # Log traceback
        return None

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    # Initialize history if not present, adding the system prompt
    if client_id not in conversation_history:
         conversation_history[client_id] = [
            # System prompt - adjust content as needed for Shuka
            {"role": "system", "content": "You are FarmSocial AI, a helpful assistant for Kannada-speaking farmers. Respond naturally and informatively in Kannada based on the user's voice or text input."}
        ]

    try:
        while True:
            data = await websocket.receive()
            response_text = None
            user_message_for_history = None # Store what the user actually said/typed

            if shuka_pipeline is None:
                logger.error("Shuka pipeline not initialized. Cannot process request.")
                await manager.send_personal_message(json.dumps({"status": "error", "message": "AI processing service unavailable."}), client_id)
                continue

            # Build base turns from history (excluding the system prompt if the pipeline adds it implicitly)
            # Let's assume the pipeline needs the full history including the system prompt
            current_turns = list(conversation_history[client_id]) # Make a copy
            pipeline_input = {}

            if "text" in data:
                text_data = data["text"]
                logger.info(f"Received text from {client_id}: {text_data}")
                await manager.send_personal_message(json.dumps({"status": "processing_text", "message": "Processing text request..."}), client_id)

                user_message_for_history = text_data
                current_turns.append({"role": "user", "content": text_data})
                pipeline_input = {"turns": current_turns}

            elif "bytes" in data:
                bytes_data = data["bytes"]
                logger.info(f"Received audio bytes from {client_id}: {len(bytes_data)} bytes")
                await manager.send_personal_message(json.dumps({"status": "processing_audio", "message": "Processing audio..."}), client_id)

                try:
                    # Load audio using librosa from bytes
                    # Use asyncio.to_thread for the potentially blocking librosa call
                    def load_audio_data():
                        audio_bytes = bytes_data # Keep original bytes
                        try:
                            # Try loading with librosa first (handles various formats with headers)
                            audio_array, sr = librosa.load(io.BytesIO(audio_bytes), sr=DEFAULT_SAMPLING_RATE)
                            logger.info(f"Successfully loaded audio with librosa. Original SR inferred (if any): {sr}, Resampled to: {DEFAULT_SAMPLING_RATE}")
                            return audio_array, DEFAULT_SAMPLING_RATE
                        except sf.LibsndfileError as e:
                            if "Format not recognised" in str(e) or "SoundfileError" in str(e): # Check specific error
                                logger.warning(f"Librosa failed to recognize format: {e}. Assuming raw 16-bit PCM mono @ {DEFAULT_SAMPLING_RATE}Hz.")
                                try:
                                    # Assume raw 16-bit signed integer, mono PCM
                                    # Ensure byte length is even for int16
                                    if len(audio_bytes) % 2 != 0:
                                         logger.warning(f"Audio byte length ({len(audio_bytes)}) is odd. Trimming last byte.")
                                         audio_bytes = audio_bytes[:-1]
                                    
                                    raw_audio = np.frombuffer(audio_bytes, dtype=np.int16)
                                    # Convert to float32 between -1.0 and 1.0
                                    audio_array = raw_audio.astype(np.float32) / 32768.0
                                    logger.info(f"Successfully loaded raw PCM audio. Shape: {audio_array.shape}")
                                    return audio_array, DEFAULT_SAMPLING_RATE
                                except Exception as raw_e:
                                    logger.error(f"Failed to process data as raw PCM: {raw_e}", exc_info=True)
                                    raise ValueError(f"Failed to process audio data as known format or raw PCM: {raw_e}") from raw_e # Re-raise specific error
                            else:
                                # Re-raise other libsndfile errors
                                logger.error(f"Librosa/Soundfile loading error: {e}", exc_info=True)
                                raise ValueError(f"Audio loading failed: {e}") from e # Re-raise other errors
                        except Exception as general_e:
                             # Catch any other unexpected errors during loading
                             logger.error(f"Unexpected audio loading error: {general_e}", exc_info=True)
                             raise ValueError(f"Unexpected error loading audio: {general_e}") from general_e

                    audio_array, sampling_rate = await asyncio.to_thread(load_audio_data)

                    # Send status update: Thinking (covers both STT and generation)
                    await manager.send_personal_message(json.dumps({"status": "processing_llm", "message": "Thinking..."}), client_id)

                    # Use placeholder for user content in history when input is audio
                    user_message_for_history = "<audio_input>"
                    current_turns.append({"role": "user", "content": "<|audio|>"}) # Special token for pipeline
                    pipeline_input = {
                        "audio": audio_array,
                        "sampling_rate": sampling_rate,
                        "turns": current_turns
                    }

                except Exception as e:
                    logger.error(f"Error processing audio for {client_id}: {e}", exc_info=True)
                    await manager.send_personal_message(json.dumps({"status": "error", "message": f"Error processing audio: {e}"}), client_id)
                    continue # Skip to next message

            # --- Call Shuka Pipeline --- #
            if pipeline_input:
                logger.info(f"Calling Shuka pipeline for {client_id}...")
                logger.debug(f"Pipeline Input Keys: {list(pipeline_input.keys())}") # Log keys being sent
                logger.debug(f"Turns being sent: {pipeline_input.get('turns')}") # Log turns

                try:
                    # Use asyncio.to_thread for the blocking pipeline call
                    def run_shuka_pipeline():
                        # max_new_tokens might be needed, adjust as necessary
                        # Check pipeline output format - assuming it's a list with the generated text
                        result = shuka_pipeline(pipeline_input, max_new_tokens=256) # Adjust max_new_tokens
                        # --- Log the raw response received --- (Need to know result format)
                        logger.debug(f"Raw Shuka Pipeline Response: {result}")
                        # Extract text - This depends heavily on the pipeline's specific output structure!
                        # Example guess: result might be a list of dictionaries
                        if isinstance(result, list) and result:
                            generated_content = result[0].get('generated_text')
                            # Sometimes the output includes the whole conversation history
                            # We might need to extract only the last assistant message
                            if isinstance(generated_content, list):
                                last_turn = generated_content[-1]
                                if last_turn.get('role') == 'assistant':
                                    return last_turn.get('content', "").strip()
                            elif isinstance(generated_content, str):
                                 # If it's just the response string
                                 return generated_content.strip()
                        # Fallback/alternative structure check?
                        return None # Indicate failure if text not found

                    response_text = await asyncio.to_thread(run_shuka_pipeline)

                    if response_text:
                        logger.info(f"Received Shuka response for {client_id}: {response_text[:100]}...")
                    else:
                        logger.error(f"Shuka pipeline did not return expected text output for {client_id}. Raw: {response_text}") # Log raw response if extraction failed
                        response_text = None # Ensure it's None if extraction failed

                except Exception as e:
                    logger.error(f"Error calling Shuka pipeline for {client_id}: {e}", exc_info=True)
                    await manager.send_personal_message(json.dumps({"status": "error", "message": f"Error generating response: {e}"}), client_id)
                    response_text = None # Ensure failure

            # --- Process Response (TTS and History) --- #
            if user_message_for_history:
                 # Add user message to history *before* adding assistant response
                 conversation_history[client_id].append({"role": "user", "content": user_message_for_history})

            if response_text:
                # Add assistant response to history
                conversation_history[client_id].append({"role": "assistant", "content": response_text})

                # Optional: Limit history size
                MAX_HISTORY_LEN = 10 # Keep system + 4 pairs
                if len(conversation_history[client_id]) > MAX_HISTORY_LEN:
                     conversation_history[client_id] = [
                         conversation_history[client_id][0]] + conversation_history[client_id][-MAX_HISTORY_LEN+1:]

                # --- TTS --- #
                await manager.send_personal_message(json.dumps({"status": "processing_tts", "message": "Generating audio response..."}), client_id)
                audio_output_base64 = await get_tts_audio(response_text)

                if audio_output_base64:
                    response_payload = {
                        "status": "response_ready",
                        "text": response_text,
                        "audio_base64": audio_output_base64
                    }
                    await manager.send_personal_message(json.dumps(response_payload), client_id)
                else:
                    logger.error(f"TTS generation failed for client {client_id}.")
                    await manager.send_personal_message(json.dumps({
                        "status": "error",
                        "message": "Audio generation failed. Displaying text response.",
                        "text": response_text
                    }), client_id)
            elif pipeline_input: # Only send error if we actually tried to process input
                 # Shuka pipeline failed to return text
                 error_message = "AI failed to generate a response."
                 logger.error(f"Shuka Error for {client_id}: {error_message}")
                 await manager.send_personal_message(json.dumps({"status": "error", "message": error_message}), client_id)

            # else: No valid input (text/bytes) or audio processing failed earlier

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for client {client_id}. Clearing history.")
        if client_id in conversation_history: del conversation_history[client_id]
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"Error in WebSocket endpoint for client {client_id}: {e}", exc_info=True)
        # Clean up history and disconnect on general errors too
        if client_id in conversation_history: del conversation_history[client_id]
        manager.disconnect(client_id)

def get_websocket_router():
    logger.info("Returning websocket router with ConnectionManager and Shuka pipeline.")
    return router 