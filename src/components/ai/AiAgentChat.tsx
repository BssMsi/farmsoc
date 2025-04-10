import React from 'react';

interface AiAgentChatProps {
  visible: boolean;
  onClose: () => void;
  // TODO: Add props for chat messages, sending messages etc. later
}

const AiAgentChat: React.FC<AiAgentChatProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
      {/* Modal Content */}
      <div className="bg-white w-full max-w-2xl h-[75%] rounded-t-lg shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold flex-grow text-center pl-10">AI Assistant</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Close AI Assistant"
           >
            {/* Placeholder Close Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-gray-400 italic">Chat history will appear here...</p>
          {/* TODO: Render actual chat messages */}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t flex justify-center items-center">
          <button 
            className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
            aria-label="Start Recording"
          >
            {/* Placeholder Mic Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          {/* TODO: Add text input fallback? Handle recording state */}
        </div>
      </div>
    </div>
  );
};

export default AiAgentChat; 