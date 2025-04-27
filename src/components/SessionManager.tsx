import React, { useState } from 'react';
import { ChatSession } from '../hooks/useAiChat';

interface SessionManagerProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  onCreateSession: () => Promise<string | null>;
  onSwitchSession: (sessionId: string) => Promise<boolean>;
  className?: string;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  sessions,
  currentSession,
  isLoading,
  onCreateSession,
  onSwitchSession,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };

  return (
    <div className={`session-manager ${className}`}>
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-slate-300 hover:text-white focus:outline-none"
        >
          <span>Sessions</span>
          <svg 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <button
          onClick={onCreateSession}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? 'Loading...' : 'New Session'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 bg-slate-900 rounded-md border border-slate-700 max-h-60 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-slate-400 text-center">
              No sessions found. Create a new one to start chatting.
            </div>
          ) : (
            <ul className="divide-y divide-slate-700">
              {sessions.map((session) => (
                <li 
                  key={session.session_id}
                  className={`p-3 cursor-pointer hover:bg-slate-800 ${
                    currentSession?.session_id === session.session_id ? 'bg-slate-800 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => onSwitchSession(session.session_id)}
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between">
                      <span className="text-sm truncate text-slate-200">
                        Session {session.session_id.slice(0, 8)}...
                      </span>
                      {session.is_active && (
                        <span className="px-2 py-0.5 text-xs bg-green-900 text-green-300 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      Last active: {formatDate(session.last_interaction)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionManager; 