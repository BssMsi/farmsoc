import { useState, useEffect, useRef, useCallback } from 'react';

// --- Helper Function ---
function _base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// Extract navigation URL from text using a defined format
// This looks for URLs in the format: [NAVIGATE:url]
function extractNavigationUrl(text: string): string | null {
  const navigationRegex = /\[NAVIGATE:(https?:\/\/[^\]\s]+)\]/i;
  const match = text.match(navigationRegex);
  return match ? match[1] : null;
}

// --- Types ---
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'status';
  type: 'text' | 'audio' | 'error' | 'status' | 'processing'; // Added 'processing' type
  content: string; // For text/status/error/processing message
  audioBase64?: string; // Renamed from audioUrl and changed type
  timestamp: number;
  text?: string; // Optional text content (e.g., for transcribed or error with text)
  navigationUrl?: string; // Added for messages that contain a navigation request
}

export interface BackendStatus {
  // Updated status values
  status: 'idle' | 'connecting' | 'connected' | 'processing_audio' | 'transcribed' | 'processing_llm' | 'processing_tts' | 'response_ready' | 'error';
  message?: string; // Optional message (e.g., for errors or status updates)
  text?: string; // Optional text content (e.g., for transcribed or error with text)
}

// Specific type for the final successful response
interface ReadyResponseMessage {
    status: 'response_ready';
    text: string;
    audio_base64: string;
    navigation_url?: string; // Added navigation URL field
    performance?: {
      stt_duration: number;
      llm_duration: number;
      tts_duration: number;
      total_duration: number;
    };
}

// Session interface
export interface ChatSession {
  session_id: string;
  created_at: string;
  last_interaction: string;
  is_active: boolean;
}

// Language options
export interface LanguageOption {
  code: string;
  name: string;
  flag?: string; // Optional emoji or image path
}

// Available languages based on backend support
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en-IN', name: 'English', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' }
];

// Type guard to check if a message is ReadyResponseMessage
function isReadyResponseMessage(msg: any): msg is ReadyResponseMessage {
    return msg && msg.status === 'response_ready' && typeof msg.text === 'string' && typeof msg.audio_base64 === 'string';
}

// Use import.meta.env for Vite environment variables
// Ensure VITE_WEBSOCKET_URL is defined in your .env file
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://140.245.233.27:8080/ws';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://140.245.233.27:8080';
const CLIENT_ID = `web-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;

export function useAiChat() {
  // Use localStorage for persistent chat visibility
  const [isChatVisible, setIsChatVisibleState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('aiChat_isVisible');
      return stored ? JSON.parse(stored) : false;
    } catch (e) {
      console.error('Error reading chat visibility from localStorage:', e);
      return false;
    }
  });
  
  // Update localStorage when visibility changes
  const setIsChatVisible = useCallback((isVisible: boolean) => {
    try {
      localStorage.setItem('aiChat_isVisible', JSON.stringify(isVisible));
    } catch (e) {
      console.error('Error saving chat visibility to localStorage:', e);
    }
    setIsChatVisibleState(isVisible);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Initialize with idle status
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({ status: 'idle' });
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Language selection - default to English
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  
  // Session management
  const [availableSessions, setAvailableSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  // Ref to keep track of the last message ID for potential status updates
  const lastStatusMessageId = useRef<string | null>(null);

  // Add state for current navigation URL
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  
  // Navigation handler
  const navigateTo = useCallback((url: string) => {
    console.log(`Navigating to: ${url}`);
    // We just set the URL - the consuming component can react to this change
    setNavigationUrl(url);
  }, []);
  
  // --- Session Management Functions ---
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/list?user_id=${CLIENT_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.sessions)) {
        setAvailableSessions(data.sessions);
        // Set current session to the active one, if any
        const activeSession = data.sessions.find((s: ChatSession) => s.is_active);
        if (activeSession) {
          setCurrentSession(activeSession);
        }
      } else {
        console.error('Invalid sessions data received:', data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [CLIENT_ID]);

  const createNewSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/new?user_id=${CLIENT_ID}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success' && data.session_id) {
        // Refresh sessions list to include new session
        await fetchSessions();
        return data.session_id;
      } else {
        console.error('Invalid response when creating session:', data);
        return null;
      }
    } catch (error) {
      console.error('Error creating new session:', error);
      return null;
    }
  }, [CLIENT_ID, fetchSessions]);

  const switchSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/switch?user_id=${CLIENT_ID}&session_id=${sessionId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        // Refresh sessions to update active status
        await fetchSessions();
        // Clear messages and load messages for this session
        await fetchSessionMessages(sessionId);
        return true;
      } else {
        console.error('Failed to switch session:', data);
        return false;
      }
    } catch (error) {
      console.error('Error switching session:', error);
      return false;
    }
  }, [CLIENT_ID, fetchSessions]);

  const fetchSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.messages)) {
        // Convert backend messages to ChatMessage format
        const chatMessages: ChatMessage[] = data.messages.map((msg: any) => ({
          id: `${msg.timestamp}-${msg.role}`,
          sender: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'ai' : 'status',
          type: 'text',
          content: msg.content,
          timestamp: new Date(msg.timestamp).getTime(),
          // Add audio if available for assistant messages
          ...(msg.role === 'assistant' && msg.audio_file ? { audioBase64: msg.audio_file } : {}),
        }));
        setMessages(chatMessages);
        return true;
      } else {
        console.error('Invalid session messages data:', data);
        return false;
      }
    } catch (error) {
      console.error('Error fetching session messages:', error);
      return false;
    }
  }, []);

  // --- WebSocket Management ---
  const connectWebSocket = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected.');
      setIsConnected(true); // Ensure state is accurate if re-called
      setBackendStatus({ status: 'connected' });
      return;
    }
    if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
       console.log('WebSocket connection already in progress.');
       return;
    }

    setBackendStatus({ status: 'connecting', message: 'Connecting to AI Assistant...' });
    console.log(`Attempting to connect WebSocket to ${WEBSOCKET_URL}/${CLIENT_ID}...`);

    // Add error handling for WebSocket constructor itself
    try {
        const socket = new WebSocket(`${WEBSOCKET_URL}/${CLIENT_ID}`);
        console.log("[WebSocket] Created WebSocket instance:", socket);
        ws.current = socket;

        // --- Assign event handlers directly ---
        console.log("[WebSocket] Assigning onopen handler...");
        socket.onopen = () => {
            console.log('[WebSocket] onopen fired. ws.current:', ws.current);
            setIsConnected(true);
            setBackendStatus({ status: 'connected', message: 'Connected. Ready to chat.' });
            
            // Fetch sessions when connected
            fetchSessions();
        };

        console.log("[WebSocket] Assigning onerror handler...");
        socket.onerror = (event) => {
            console.error('WebSocket error:', event);
            setBackendStatus({ status: 'error', message: 'Connection error. Please try again later.' });
            setIsConnected(false);
        };

        console.log("[WebSocket] Assigning onclose handler...");
        socket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason, 'ws.current:', ws.current);
            setIsConnected(false);
            const message = event.wasClean ? 'Disconnected.' : `Connection lost unexpectedly (Code: ${event.code}).`;
            setBackendStatus({ status: 'idle', message });
            if (lastStatusMessageId.current) {
                setMessages(prev => prev.filter(msg => msg.id !== lastStatusMessageId.current));
            }
            lastStatusMessageId.current = null;
            // Ensure ref is cleared on close, only if it matches the closed socket
            if (ws.current === socket) {
                console.log("[WebSocket] Clearing ws.current in onclose handler.")
                ws.current = null;
            }
        };

        // --- Assign onmessage --- Restore full handler but keep logs ---
        console.log("[WebSocket] Assigning onmessage handler. Current ws.current:", ws.current);
        socket.onmessage = (event) => {
             // --- Full handler logic reinstated --- Restore this if the assignment log appears
             if (typeof event.data === 'string') {
                console.log("[WebSocket] Raw message received:", event.data.substring(0, 200) + "...");
                try {
                    const parsedData = JSON.parse(event.data);
                    console.log("[WebSocket] Parsed data:", parsedData);

                    const isReady = isReadyResponseMessage(parsedData);
                    console.log("[WebSocket] isReadyResponseMessage check:", isReady);

                    if (isReady) {
                        console.log("[WebSocket] Handling response_ready message...");
                        const backendMsg = parsedData;
                        setBackendStatus({ status: 'connected', message: 'Ready.' });
                        const timestamp = Date.now();
                        
                        // Check for navigation URL - either from direct field or extracted from text
                        let navigationUrl = backendMsg.navigation_url || null;
                        
                        // Create message with possible navigation URL
                        const newMessage: ChatMessage = {
                            id: timestamp.toString(), 
                            sender: 'ai', 
                            type: 'text',
                            content: backendMsg.text, 
                            audioBase64: backendMsg.audio_base64, 
                            timestamp,
                            navigationUrl: navigationUrl || undefined,
                        };
                        
                        setMessages(prev => [...prev, newMessage]);
                        playAudio(backendMsg.audio_base64);
                        lastStatusMessageId.current = null;
                        
                        // Handle navigation if URL was found
                        if (navigationUrl) {
                            console.log(`Navigation URL detected: ${navigationUrl}`);
                            navigateTo(navigationUrl);
                        }
                        
                        // Log performance metrics if available
                        if (backendMsg.performance) {
                          console.log('Performance metrics:', backendMsg.performance);
                        }
                    } else {
                        const backendMsg = parsedData as BackendStatus;
                        console.log(`[WebSocket] Handling status message: ${backendMsg.status}`);
                        setBackendStatus({
                            status: backendMsg.status,
                            message: backendMsg.message || undefined,
                            text: backendMsg.text || undefined
                        });

                        const timestamp = Date.now();
                        let newMessage: ChatMessage | null = null;

                        switch (backendMsg.status) {
                           case 'processing_audio':
                           case 'processing_llm':
                           case 'processing_tts':
                             if (lastStatusMessageId.current) {
                                 setMessages(prev => prev.map(msg =>
                                     msg.id === lastStatusMessageId.current ? { ...msg, content: `Status: ${backendMsg.message || backendMsg.status}`, type: 'processing' } : msg
                                 ));
                             } else {
                                 const newId = timestamp.toString();
                                 newMessage = { id: newId, sender: 'status', type: 'processing', content: `Status: ${backendMsg.message || backendMsg.status}`, timestamp };
                                 lastStatusMessageId.current = newId;
                             }
                             break;

                           case 'transcribed':
                             // Always add the transcribed text as a new user message
                             if (backendMsg.text) {
                               const transcribedMessage: ChatMessage = {
                                 id: timestamp.toString() + '-user',
                                 sender: 'user',
                                 type: 'text',
                                 content: backendMsg.text,
                                 timestamp
                               };
                               setMessages(prev => [...prev.filter(msg => msg.id !== lastStatusMessageId.current), transcribedMessage]);
                             }
                             // Clear the status message ID as we've now shown the user's text
                             lastStatusMessageId.current = null;
                             break;

                           case 'error':
                             const errorContent = `Error: ${backendMsg.message || 'Unknown backend error.'}${backendMsg.text ? ` (AI Response: ${backendMsg.text})` : ''}`;
                             newMessage = { id: timestamp.toString(), sender: 'status', type: 'error', content: errorContent, timestamp };

                             if (lastStatusMessageId.current) {
                                 setMessages(prev => prev.map(msg =>
                                     msg.id === lastStatusMessageId.current ? { ...newMessage!, id: msg.id } : msg
                                 ));
                                 newMessage = null;
                             }
                             lastStatusMessageId.current = null;
                             break;

                            case 'connected':
                               if (lastStatusMessageId.current && messages.find(m => m.id === lastStatusMessageId.current)?.type === 'processing') {
                                   setMessages(prev => prev.filter(msg => msg.id !== lastStatusMessageId.current));
                                   lastStatusMessageId.current = null;
                               }
                               break;
                         }
                         if (newMessage) {
                            setMessages(prev => [...prev, newMessage!]);
                         }
                    }
                } catch (e) {
                    console.error('[WebSocket] Failed to parse JSON or process message:', event.data, e);
                    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'status', type: 'error', content: 'Received unreadable message from server.', timestamp: Date.now() }]);
                    setBackendStatus({ status: 'error', message: 'Communication error.' });
                    lastStatusMessageId.current = null;
                }
            } else {
                console.warn('[WebSocket] Received unexpected non-string message type:', typeof event.data, event.data);
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'status', type: 'error', content: 'Received unexpected data format from server.', timestamp: Date.now() }]);
                setBackendStatus({ status: 'error', message: 'Communication error.' });
                lastStatusMessageId.current = null;
            }
        }; // End of onmessage handler assignment
        console.log("[WebSocket] Assigned onmessage handler.");

    } catch (error) {
        console.error('WebSocket constructor failed:', error);
        setBackendStatus({ status: 'error', message: 'Failed to initialize connection. Invalid URL?' });
        setIsConnected(false);
        ws.current = null; // Ensure ws.current is null if constructor fails
        return;
    }
  }, [fetchSessions, navigateTo]);

  const disconnectWebSocket = useCallback(() => {
    if (ws.current) {
      console.log('Disconnecting WebSocket...');
      // Reset status before closing
      setBackendStatus({ status: 'idle', message: 'Disconnected.' });
      ws.current.close(1000, "User disconnected"); // Use standard code 1000 for normal closure
      ws.current = null;
      setIsConnected(false);
      lastStatusMessageId.current = null;
    }
  }, []);

  // --- Audio Recording ---
  const startRecording = async () => {
    if (isRecording) return;
    if (!isConnected || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error('Cannot start recording: WebSocket not connected.');
        setBackendStatus({ status: 'error', message: 'Not connected. Please wait or reconnect.'});
        return;
    }
    
    // Check if mediaDevices API is available
    if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('MediaDevices API not supported in this browser');
        setBackendStatus({ 
            status: 'error', 
            message: 'Audio recording is not supported in this browser. Please try using a modern browser with HTTPS.'
        });
        return;
    }
    
    console.log('Starting recording...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Optional: Check mime types supported by MediaRecorder
      // const options = { mimeType: 'audio/webm;codecs=opus' }; // Example
      // if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      //    console.warn(`${options.mimeType} not supported, using default.`);
      //    mediaRecorder.current = new MediaRecorder(stream);
      // } else {
      //    mediaRecorder.current = new MediaRecorder(stream, options);
      // }
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = []; // Reset chunks

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        console.log('Recording stopped. Processing audio...');
        const audioBlob = new Blob(audioChunks.current, { type: mediaRecorder.current?.mimeType || 'audio/wav' });

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          try {
            // Create a JSON message with language and binary data
            // For audio, we need special handling
            const languageMsg = { language: selectedLanguage.code };
            const jsonString = JSON.stringify(languageMsg);
            
            // Log the language we're using
            console.log(`Sending audio with language: ${selectedLanguage.code}`);
            
            // Send binary data directly, with language as part of the message metadata
            // The backend will extract this from the request
            ws.current.send(audioBlob);
            
            // Optionally send language info in a separate message if needed
            // ws.current.send(jsonString);
            
            console.log("Audio blob sent via WebSocket.");

            // Add a placeholder message for the user's audio
            const sendingMsgId = Date.now().toString();
            const optimisticMessage: ChatMessage = { 
              id: sendingMsgId, 
              sender: 'user', 
              type: 'processing', 
              content: `You (audio in ${selectedLanguage.name}) - Sending...`, 
              timestamp: Date.now() 
            };
            setMessages(prev => [...prev, optimisticMessage]);
            console.log("Added optimistic sending message:", optimisticMessage);
            lastStatusMessageId.current = sendingMsgId; // Track this message for potential updates
          } catch (err) {
            console.error('Error sending audio data:', err);
            setBackendStatus({ status: 'error', message: 'Failed to send audio. Please try again.'});
          }
        } else {
           console.error('WebSocket not open when trying to send audio.');
           setBackendStatus({ status: 'error', message: 'Connection lost before sending. Please try again.'}); // More specific error
           // Remove the optimistic "Sending..." message if connection lost immediately
           if(lastStatusMessageId.current) {
                setMessages(prev => prev.filter(msg => msg.id !== lastStatusMessageId.current));
                lastStatusMessageId.current = null;
           }
        }
        // Stop tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      // Update status while recording
      setBackendStatus({ status: 'connected', message: 'Recording...' });

    } catch (err) {
      console.error('Error starting recording:', err);
      let errorMsg = 'Could not start recording.';
      if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              errorMsg = 'Microphone permission denied. Please allow access in browser settings.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              errorMsg = 'No microphone found. Please ensure a microphone is connected and enabled.';
          } else {
               errorMsg = `Could not start recording: ${err.message}`;
          }
      }
      setBackendStatus({ status: 'error', message: errorMsg });
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorder.current) return;
    console.log('Stopping recording...');
    // Check state to avoid stopping if already stopped
    if (mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
    }
    setIsRecording(false);
    // Update status after stopping recording, before sending starts
    setBackendStatus({ status: 'connected', message: 'Sending audio...' });
  };

  // Send text message directly
  const sendTextMessage = useCallback((text: string) => {
    if (!isConnected || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket not connected.');
      setBackendStatus({ status: 'error', message: 'Not connected. Please wait or reconnect.'});
      return;
    }

    try {
      // Create message with text and language
      const message = {
        text: text,
        language: selectedLanguage.code
      };

      // Send as JSON
      ws.current.send(JSON.stringify(message));
      console.log(`Sent text message with language: ${selectedLanguage.code}`);

      // Add user message to chat
      const timestamp = Date.now();
      const userMessage: ChatMessage = {
        id: timestamp.toString(),
        sender: 'user',
        type: 'text',
        content: text,
        timestamp
      };
      setMessages(prev => [...prev, userMessage]);

      // Add processing message
      const processingMsgId = (timestamp + 1).toString();
      const processingMessage: ChatMessage = {
        id: processingMsgId,
        sender: 'status',
        type: 'processing',
        content: 'Processing your message...',
        timestamp: timestamp + 1
      };
      setMessages(prev => [...prev, processingMessage]);
      lastStatusMessageId.current = processingMsgId;

    } catch (err) {
      console.error('Error sending text message:', err);
      setBackendStatus({ status: 'error', message: 'Failed to send message. Please try again.'});
    }
  }, [isConnected, selectedLanguage.code]);

  // --- Audio Playback (Now expects Base64) ---
  const playAudio = useCallback(async (audioBase64: string) => {
    try {
      console.log("Attempting to play audio from base64...");
      const audioBytes = _base64ToArrayBuffer(audioBase64);

      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Ensure context is running (required after user interaction)
      if (audioContext.current.state === 'suspended') {
         await audioContext.current.resume();
      }

      const audioBuffer = await audioContext.current.decodeAudioData(audioBytes);
      const source = audioContext.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.current.destination);
      source.start();
      console.log("Audio playback started.");
    } catch (error) {
      console.error('Error playing audio:', error);
      // Add specific error message to chat
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'status', type: 'error', content: 'Failed to play audio response.', timestamp: Date.now() }]);
      // Update backend status to reflect playback error?
      setBackendStatus(prev => ({ ...prev, message: 'Failed to play audio.' }));
    }
  }, []); // Add dependencies if audioContext could change, but useRef should be stable

  // --- Effects ---
  // Connect WebSocket when chat becomes visible
  useEffect(() => {
    if (isChatVisible) {
      connectWebSocket();
    } else {
      stopRecording();
      disconnectWebSocket();
    }
    // Cleanup on unmount
    return () => {
      if (ws.current) {
        stopRecording();
        disconnectWebSocket();
      }
    };
  }, [isChatVisible, connectWebSocket, disconnectWebSocket]);

  // Auto-load session data on component mount if chat is visible
  useEffect(() => {
    // Only fetch if we don't already have sessions and the chat is visible
    if (isChatVisible && availableSessions.length === 0 && !isLoadingSessions) {
      fetchSessions().then(() => {
        // If we have a currentSession after fetching, load its messages
        if (currentSession?.session_id) {
          fetchSessionMessages(currentSession.session_id);
        }
      });
    }
  }, [isChatVisible, availableSessions.length, currentSession, fetchSessions, fetchSessionMessages, isLoadingSessions]);

  // Cleanup audio context
  useEffect(() => {
    // Initialize AudioContext lazily on first playback attempt
    return () => {
      audioContext.current?.close().catch(e => console.error("Error closing AudioContext:", e));
      audioContext.current = null; // Ensure it's cleaned up
    };
  }, []);

  // --- Return values from hook ---
  return {
    isChatVisible,
    setIsChatVisible,
    messages,
    backendStatus, // The UI component will use this for indicators
    isRecording,
    isConnected,
    startRecording,
    stopRecording,
    playAudio, // Expose playAudio for replaying messages
    sendTextMessage, // Add direct text message sending
    
    // Language selection
    selectedLanguage,
    setSelectedLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    
    // Session management
    availableSessions,
    currentSession,
    isLoadingSessions,
    fetchSessions,
    createNewSession,
    switchSession,
    fetchSessionMessages,
    
    // Navigation
    navigationUrl,
    resetNavigation: () => setNavigationUrl(null), // Provide a way to reset after navigation is handled
  };
} 