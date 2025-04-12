import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Bot, User, AlertCircle, Loader2, Play } from 'lucide-react'; // Import icons
import { ChatMessage, BackendStatus } from '../../hooks/useAiChat'; // CORRECTED Import path

interface AiAgentChatProps {
  visible: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  backendStatus: BackendStatus;
  isRecording: boolean;
  isConnected: boolean;
  onRecordStart: () => Promise<void>; // Can potentially throw errors
  onRecordStop: () => void;
  onPlayAudio: (audioBase64: string) => Promise<void>; // Add prop for playing audio
}

const AiAgentChat: React.FC<AiAgentChatProps> = ({
  visible,
  onClose,
  messages,
  backendStatus,
  isRecording,
  isConnected,
  onRecordStart,
  onRecordStop,
  onPlayAudio, // Destructure the new prop
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive or status changes affecting layout
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, backendStatus]); // Add backendStatus dependency

  if (!visible) return null;

  const handleMicClick = () => {
    if (isRecording) {
      onRecordStop();
    } else {
      onRecordStart().catch(err => {
          // Error handling is likely done within the hook, but catch here just in case
          console.error("Failed to start recording from component:", err);
      });
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    const isAiResponseWithAudio = msg.sender === 'ai' && msg.type === 'text' && !!msg.audioBase64;

    return (
      <div className="flex flex-col">
        <p className={isAiResponseWithAudio ? "mr-10" : ""}>{msg.content}</p> {/* Add margin if play button is present */}
        {isAiResponseWithAudio && (
          <button
            onClick={() => msg.audioBase64 && onPlayAudio(msg.audioBase64)}
            className="absolute bottom-1 right-1 p-1 text-purple-600 hover:text-purple-800 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-full"
            aria-label="Play AI response"
          >
            <Play className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  const getMessageStyle = (msg: ChatMessage) => {
     let baseStyle = "relative p-3 rounded-lg max-w-[75%] break-words shadow-sm"; // Added relative for button positioning
     if (msg.sender === 'user') {
         // Differentiate processing message from final user text
         return `${baseStyle} ${msg.type === 'processing' ? 'bg-blue-50 text-gray-600 italic' : 'bg-blue-100'} self-end`;
     } else if (msg.sender === 'ai') {
         return `${baseStyle} bg-purple-50 self-start`; // Changed AI background slightly
     } else { // status or error
         const isError = msg.type === 'error';
         const bgColor = isError ? 'bg-red-50' : 'bg-yellow-50';
         const textColor = isError ? 'text-red-700' : 'text-gray-500';
         return `${baseStyle} ${bgColor} self-center text-sm italic ${textColor}`;
     }
  };

  const getIconForSender = (sender: ChatMessage['sender'], type: ChatMessage['type']) => {
     if(sender === 'user') return <User className="w-5 h-5 text-blue-700" />;
     if(sender === 'ai') return <Bot className="w-5 h-5 text-purple-600" />;
     // Status / Error / Processing
     if(type === 'error') return <AlertCircle className="w-5 h-5 text-red-600" />;
     if(type === 'processing') return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
     return <AlertCircle className="w-5 h-5 text-yellow-600" />; // Default for other statuses
  };

  // Determine status text to display
  const getStatusDisplay = () => {
      if (!isConnected && backendStatus.status === 'idle') return "Disconnected";
      if (backendStatus.status === 'connecting') return "Connecting...";
      if (backendStatus.status === 'error') return `Error: ${backendStatus.message || 'Unknown error'}`;
      if (!isConnected) return "Disconnected"; // Fallback if connected is false but status isn't idle

      // Connected states
      let statusText = "Connected";
      let showLoader = false;

      switch(backendStatus.status) {
          case 'processing_audio':
          case 'transcribed': // Keep loader active until LLM starts
          case 'processing_llm':
          case 'processing_tts':
            statusText = backendStatus.message || backendStatus.status.replace('_', ' ');
            showLoader = true;
            break;
          case 'connected': // Includes 'Ready' state after response
            statusText = backendStatus.message || 'Ready';
            break;
          // response_ready status is transient, usually quickly followed by connected/Ready
      }

      return (
         <>
           {statusText}
           {showLoader && <Loader2 className="inline w-3 h-3 ml-1 animate-spin"/>}
         </>
      );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50 backdrop-blur-sm">
      {/* Modal Content */}
      <div className="bg-white w-full max-w-2xl h-[75%] rounded-t-lg shadow-xl flex flex-col overflow-hidden">
        {/* Header - Status removed from here */}
        <div className="flex justify-between items-center p-3 border-b">
           {/* <div className="flex items-center space-x-2">
             <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : (backendStatus.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500')}`}></span>
             <span className={`text-xs ${backendStatus.status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
                {getStatusDisplay()}
             </span>
           </div> */}
           {/* Empty div to push title to center if needed or adjust styling */}
           <div className="w-16"></div> 
          <h2 className="text-lg font-semibold flex-grow text-center">AI Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Close AI Assistant"
           >
             {/* Close Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender !== 'user' && (
                 <div className="flex-shrink-0 mt-1">{getIconForSender(msg.sender, msg.type)}</div>
              )}
              <div className={getMessageStyle(msg)}>
                 {renderMessageContent(msg)}
                 {/* <span className="text-xs text-gray-400 block mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</span> */} {/* Optional timestamp */}
              </div>
               {msg.sender === 'user' && (
                 <div className="flex-shrink-0 mt-1">{getIconForSender(msg.sender, msg.type)}</div>
               )}
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Element to scroll to */}
        </div>

        {/* Status Display Area - Added above input */} 
        <div className="p-2 border-t text-center text-sm text-gray-500">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : (backendStatus.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500')}`}></span>
          <span className={`${backendStatus.status === 'error' ? 'text-red-600' : ''}`}>
             {getStatusDisplay()}
          </span>
        </div>

        {/* Input Area */} 
        <div className="p-4 border-t flex justify-center items-center bg-gray-50">
          <button
            onClick={handleMicClick}
            disabled={!isConnected || backendStatus.status.startsWith('processing') || backendStatus.status === 'transcribed'}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'} ${(!isConnected || backendStatus.status.startsWith('processing') || backendStatus.status === 'transcribed') ? 'bg-gray-400 cursor-not-allowed' : ''}`}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAgentChat; 