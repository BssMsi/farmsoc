import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, ShoppingCart, User, PlusCircle, LineChart, Users, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';
import AiAgentButton from '../components/ai/AiAgentButton';
import AiAgentChat from '../components/ai/AiAgentChat';
import { useAiChat } from '../hooks/useAiChat';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isChatVisible,
    setIsChatVisible,
    messages,
    backendStatus,
    isRecording,
    isConnected,
    startRecording,
    stopRecording,
    playAudio,
    navigationUrl,
    resetNavigation,
  } = useAiChat();

  // Handle AI-driven navigation
  React.useEffect(() => {
    if (navigationUrl) {
      console.log(`Performing navigation to: ${navigationUrl}`);
      
      // Check if it's an absolute URL (external link)
      if (navigationUrl.startsWith('http://') || navigationUrl.startsWith('https://')) {
        // Open external links in a new tab
        window.open(navigationUrl, '_blank');
      } else {
        // For app routes, use the navigate function
        // Ensure route starts with /app if it doesn't already
        const route = navigationUrl.startsWith('/app') 
          ? navigationUrl 
          : `/app${navigationUrl === '/' ? '/home' : navigationUrl}`;
        
        navigate(route);
      }
      
      // Reset navigation state after handling
      resetNavigation();
    }
  }, [navigationUrl, navigate, resetNavigation]);

  const renderBottomTabs = () => {
    const isActive = (path: string) => location.pathname === `/app/${path}`;
    
    switch (user?.role as UserRole) {
      case 'consumer':
        return (
          <>
            <button 
              onClick={() => navigate('/app/home')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('home') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => navigate('/app/explore')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('explore') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <Search size={24} />
              <span className="text-xs mt-1">Explore</span>
            </button>
            <button 
              onClick={() => navigate('/app/events')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('events') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <Calendar size={24} />
              <span className="text-xs mt-1">Events</span>
            </button>
            <button 
              onClick={() => navigate('/app/cart')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('cart') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <ShoppingCart size={24} />
              <span className="text-xs mt-1">Cart</span>
            </button>
            <button 
              onClick={() => navigate('/app/profile')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('profile') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <User size={24} />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </>
        );
      
      case 'farmer':
        return (
          <>
            <button 
              onClick={() => navigate('/app/home')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('home') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => navigate('/app/add')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('add') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <PlusCircle size={24} />
              <span className="text-xs mt-1">Add</span>
            </button>
            <button 
              onClick={() => navigate('/app/events')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('events') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <Calendar size={24} />
              <span className="text-xs mt-1">Events</span>
            </button>
            <button 
              onClick={() => navigate('/app/crop-requests')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('crop-requests') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <FileText size={24} />
              <span className="text-xs mt-1">Requests</span>
            </button>
            <button 
              onClick={() => navigate('/app/profile')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('profile') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <User size={24} />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </>
        );
      
      case 'influencer':
        return (
          <>
            <button 
              onClick={() => navigate('/app/home')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('home') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => navigate('/app/dashboard')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('dashboard') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <LineChart size={24} />
              <span className="text-xs mt-1">Dashboard</span>
            </button>
            <button 
              onClick={() => navigate('/app/collaborations')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('collaborations') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <Users size={24} />
              <span className="text-xs mt-1">Collaborations</span>
            </button>
            <button 
              onClick={() => navigate('/app/requirements')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('requirements') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <FileText size={24} />
              <span className="text-xs mt-1">Requirements</span>
            </button>
            <button 
              onClick={() => navigate('/app/profile')} 
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive('profile') ? 'text-farmsoc-primary' : 'text-gray-500'}`}
            >
              <User size={24} />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </>
        );
      
      default:
        return null;
    }
  };

  const isFarmer = user?.role === 'farmer';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white border-b">
         <div className="text-2xl font-semibold text-farmsoc-primary">FarmSoc</div>
         <div className="flex items-center space-x-4">
           <button 
             onClick={() => navigate('/app/messages')} 
             className="p-2 text-gray-600 hover:text-farmsoc-primary"
           >
             <MessageSquare size={24} />
           </button>
           {user?.profileImage && (
             <img 
               src={user.profileImage} 
               alt="Profile" 
               className="w-8 h-8 rounded-full object-cover cursor-pointer"
               onClick={() => navigate('/app/profile')}
             />
           )}
         </div>
       </header>
      
      <main className="flex-1 overflow-y-auto">
        <div className="pb-[4.5rem]">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around bg-white border-t h-[4rem] z-10">
        {renderBottomTabs()}
      </nav>

      {isFarmer && (
        <>
          <AiAgentButton onPress={() => setIsChatVisible(true)} />
          <AiAgentChat
            visible={isChatVisible}
            onClose={() => setIsChatVisible(false)}
            messages={messages}
            backendStatus={backendStatus}
            isRecording={isRecording}
            isConnected={isConnected}
            onRecordStart={startRecording}
            onRecordStop={stopRecording}
            onPlayAudio={playAudio}
          />
        </>
      )}
    </div>
  );
};

export default AppLayout;
