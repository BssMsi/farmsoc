
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchFarmers } from '../../services/apiService';
import { getChats, startNewChat } from '../../services/messagingService';
import { getMessageQueue } from '../../services/messageQueueService';
import { useAuth } from '../../contexts/AuthContext';
import ChatListItem from '../../components/common/ChatListItem';
import { Chat } from '../../types/message';
import { User } from '../../types/user';
import { useToast } from '@/hooks/use-toast';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingMessages, setPendingMessages] = useState(0);

  // Get user chats
  const { data: chats = [], isLoading, refetch } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: () => getChats(user?.id || '', false),
    enabled: !!user,
    refetchInterval: 10000, // Poll for new chats every 10 seconds
  });

  // Sort chats by updatedAt date
  const sortedChats = [...chats].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Track pending messages count
  useEffect(() => {
    if (!user) return;
    
    const messageQueue = getMessageQueue(() => Promise.reject('Not implemented'));
    
    const checkPendingCount = async () => {
      const count = await messageQueue.pendingCount();
      setPendingMessages(count);
    };
    
    // Check immediately and then every 3 seconds
    checkPendingCount();
    const intervalId = setInterval(checkPendingCount, 3000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchFarmers(searchQuery);
      if (user) {
        // Filter out current user from results
        setSearchResults(results.filter(r => r.id !== user.id));
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (selectedUser: User) => {
    if (!user) return;
    
    try {
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        !chat.isGroup && chat.participants.includes(selectedUser.id)
      );
      
      if (existingChat) {
        navigate(`/app/chat/${existingChat.id}`);
        return;
      }
      
      // Create new chat
      const newChat = await startNewChat([user.id, selectedUser.id], false);
      
      toast({
        title: "Chat created",
        description: `You can now chat with ${selectedUser.name}`,
      });
      
      // Refetch chats to get the new one
      refetch();
      
      // Navigate to the new chat
      navigate(`/app/chat/${newChat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Could not create chat at this time",
        variant: "destructive"
      });
    } finally {
      setShowNewChatModal(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  useEffect(() => {
    // Debounced search
    const timeoutId = setTimeout(() => {
      if (showNewChatModal && searchQuery.trim()) {
        handleSearch();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, showNewChatModal]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-semibold">Messages</h1>
        <div className="flex items-center">
          {pendingMessages > 0 && (
            <div className="mr-3 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {pendingMessages} queued
            </div>
          )}
          <button 
            className="p-2 bg-farmsoc-primary text-white rounded-full"
            onClick={() => setShowNewChatModal(true)}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading chats...</div>
        ) : sortedChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">
              Start a conversation with a farmer or other users by clicking the + button above.
            </p>
          </div>
        ) : (
          sortedChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              onClick={() => navigate(`/app/chat/${chat.id}`)}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
      
      {/* New chat modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">New Message</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-center border rounded-lg overflow-hidden mb-4">
                <input
                  type="text"
                  placeholder="Search for farmers..."
                  className="flex-1 px-4 py-2 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  className="p-2 bg-gray-100 text-gray-600"
                  onClick={handleSearch}
                >
                  <Search size={20} />
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="text-center p-4 text-gray-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  searchQuery ? (
                    <div className="text-center p-4 text-gray-500">No users found</div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      Search for farmers or other users to start a conversation
                    </div>
                  )
                ) : (
                  searchResults.map((result) => (
                    <div 
                      key={result.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStartChat(result)}
                    >
                      <img 
                        src={result.profileImage || 'https://via.placeholder.com/40'} 
                        alt={result.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">
                          {result.role.charAt(0).toUpperCase() + result.role.slice(1)}
                          {result.location ? ` • ${result.location}` : ''}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowNewChatModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
