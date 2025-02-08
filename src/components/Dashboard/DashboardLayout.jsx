import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from '../chatbot';
import { MessageSquare } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isSidebarOpen 
          ? isSidebarMinimized 
            ? 'md:ml-24' 
            : 'md:ml-72' 
          : 'ml-0'
        }
      `}>
        <Header 
          toggleSidebar={toggleSidebar}
          toggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          isSidebarMinimized={isSidebarMinimized}
          isMobile={isMobile}
        />
        <main className="mt-20 transition-all duration-300 ease-in-out p-6 relative">
          {children}

          {/* Chatbot FAB */}
          <div className="fixed bottom-0 right-0 mb-20 mr-6 z-[9999] print:hidden">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`
                w-14 h-14 flex items-center justify-center
                bg-blue-600 text-white rounded-full shadow-lg 
                hover:bg-blue-700 transition-all duration-300
                animate-pulse-ring 
                hover:scale-110
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
              `}
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>

          {/* Chatbot Modal */}
          {showChat && (
            <div className="fixed bottom-32 right-6 z-[9998] print:hidden">
              <div className="w-[380px] h-[600px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-180px)]">
                <Chatbot onClose={() => setShowChat(false)} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Moved Sidebar after the main content */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        isMinimized={isSidebarMinimized}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
};

export default DashboardLayout;