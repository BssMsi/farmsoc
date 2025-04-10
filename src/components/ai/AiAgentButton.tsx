import React from 'react';

interface AiAgentButtonProps {
  onPress: () => void;
}

const AiAgentButton: React.FC<AiAgentButtonProps> = ({ onPress }) => {
  return (
    <button 
      onClick={onPress}
      className="fixed bottom-20 right-5 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 z-50"
      aria-label="Open AI Assistant"
    >
      {/* Placeholder Icon - Replace with a proper SVG or icon library */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};

export default AiAgentButton; 