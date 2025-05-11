import React, { useRef, useEffect, useState } from 'react';
import { useAiChat, ChatMessage } from '../hooks/useAiChat';
import LanguageSelector from './LanguageSelector';
import SessionManager from './SessionManager';

// Optional but may be needed
interface ChatInterfaceProps {
  onClose?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const {
    messages,
    backendStatus,
    isRecording,
    isConnected,
    startRecording,
    stopRecording,
    playAudio,
    sendTextMessage,
    
    // Language selection props
    selectedLanguage,
    setSelectedLanguage,
    supportedLanguages,
    
    // Session management props
    availableSessions,
    currentSession,
    isLoadingSessions,
    createNewSession,
    switchSession,
  } = useAiChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState('');

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle text message submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    sendTextMessage(textInput);
    setTextInput('');
  };

  // Status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2">
      <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></span>
      <span className="text-sm text-slate-300">{backendStatus.message || (isConnected ? 'Connected' : 'Disconnected')}</span>
    </div>
  );

  return (
    <div className="bg-slate-900 text-white rounded-lg shadow-xl max-w-4xl mx-auto h-[600px] flex flex-col">
      {/* Header with language selector and session manager */}
      <header className="p-4 border-b border-slate-700 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">kisanlyial AI Assistant</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <ConnectionStatus />
          
          <div className="flex gap-3 w-full sm:w-auto">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              languages={supportedLanguages}
              onChange={setSelectedLanguage}
              className="w-40"
            />
            
            <SessionManager
              sessions={availableSessions}
              currentSession={currentSession}
              isLoading={isLoadingSessions}
              onCreateSession={createNewSession}
              onSwitchSession={switchSession}
              className="flex-1"
            />
          </div>
        </div>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {messages.map((message) => (
          <ChatMessageComponent 
            key={message.id} 
            message={message}
            onReplayAudio={playAudio}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <footer className="p-4 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Type a message in ${selectedLanguage.name}...`}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected}
          />
          
          <button
            type="submit"
            disabled={!isConnected || !textInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            Send
          </button>
          
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isConnected}
            className={`p-2 rounded-md ${
              isRecording ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
            } disabled:opacity-50`}
          >
            {isRecording ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </form>
        <div className="text-xs text-slate-400 mt-1">
          {isRecording ? 'Recording... Click the microphone again to stop.' : `Speaking in ${selectedLanguage.name} ${selectedLanguage.flag || ''}`}
        </div>
      </footer>
    </div>
  );
};

// Chat message component with audio replay capability
interface ChatMessageProps {
  message: ChatMessage;
  onReplayAudio?: (audioBase64: string) => void;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onReplayAudio }) => {
  let containerClasses = 'p-3 rounded-lg max-w-3/4';
  
  if (message.sender === 'user') {
    containerClasses += ' bg-blue-700 ml-auto';
  } else if (message.sender === 'ai') {
    containerClasses += ' bg-slate-800';
  } else if (message.type === 'error') {
    containerClasses += ' bg-red-900 mx-auto';
  } else if (message.type === 'processing') {
    containerClasses += ' bg-slate-800 mx-auto opacity-75 animate-pulse';
  } else {
    containerClasses += ' bg-slate-800 mx-auto text-slate-400';
  }
  
  return (
    <div className={containerClasses}>
      <div className="flex flex-col">
        <div className="flex items-start justify-between">
          <div className="font-medium">
            {message.sender === 'user' ? 'You' : message.sender === 'ai' ? 'AI' : 'System'}
          </div>
          
          {/* Replay button for AI messages with audio */}
          {message.sender === 'ai' && message.audioBase64 && onReplayAudio && (
            <button
              onClick={() => onReplayAudio(message.audioBase64!)}
              className="p-1 ml-2 text-blue-300 hover:text-blue-100 focus:outline-none"
              title="Replay audio"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="mt-1">
          {message.content}
        </div>
        
        <div className="text-xs text-slate-400 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 