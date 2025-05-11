# Kisanly Backend API

## WebSocket API

The WebSocket endpoint provides real-time communication for the chat interface, supporting both text and audio input/output.

### Connection

Connect to the WebSocket endpoint at:

```
ws://<server-url>/api/ws/<client_id>
```

Where `<client_id>` is a unique identifier for the client session.

### Message Format

Messages sent to the WebSocket can be in the following formats:

#### Text Input

```json
{
  "text": "Your text message here",
  "language": "kn-IN"
}
```

- `text`: The text message to process
- `language`: (Optional) The target language code for the response. Defaults to "kn-IN" (Kannada)

#### Audio Input

```json
{
  "bytes": <binary audio data>,
  "language": "kn-IN"
}
```

- `bytes`: Binary audio data (WAV, MP3, or WebM format)
- `language`: (Optional) The target language code for the response. Defaults to "kn-IN" (Kannada)

### Response Format

Responses from the server will be in JSON format:

#### Status Updates

```json
{
  "status": "processing_audio",
  "message": "Processing audio..."
}
```

Status codes include:
- `processing_audio`: Audio input is being processed
- `processing_text`: Text input is being processed
- `processing_stt`: Converting speech to text
- `processing_llm`: Generating a response with the language model
- `processing_tts`: Generating audio for the response
- `response_ready`: The final response is ready
- `error`: An error occurred

#### Final Response

```json
{
  "status": "response_ready",
  "text": "The response text",
  "audio_base64": "base64-encoded-audio-data",
  "performance": {
    "stt_duration": 1.2,
    "llm_duration": 0.8,
    "tts_duration": 0.6,
    "total_duration": 2.6
  }
}
```

- `text`: The text response from the AI
- `audio_base64`: Base64-encoded audio of the response
- `performance`: Performance metrics in seconds for each stage of processing

### Supported Languages

The following language codes are supported:

| Language Code | Language |
|---------------|----------|
| "en-IN" | English (India) |
| "hi-IN" | Hindi |
| "kn-IN" | Kannada |
| "te-IN" | Telugu |
| "ta-IN" | Tamil |
| "ml-IN" | Malayalam |
| "bn-IN" | Bengali |
| "mr-IN" | Marathi |
| "gu-IN" | Gujarati |
| "pa-IN" | Punjabi |

### Session Management API

The backend also provides REST endpoints for session management:

#### Create New Session

```
POST /api/sessions/new?user_id=<user_id>
```

#### List Sessions

```
GET /api/sessions/list?user_id=<user_id>
```

#### Switch Active Session

```
POST /api/sessions/switch?user_id=<user_id>&session_id=<session_id>
```

#### Get Session History

```
GET /api/sessions/<session_id>/history
```

## Implementation Details

The backend uses:
- Sarvam.ai API for speech-to-text and text-to-speech
- SQLite for session storage
- FastAPI and WebSockets for the API layer

All database operations are performed asynchronously to ensure optimal performance. 