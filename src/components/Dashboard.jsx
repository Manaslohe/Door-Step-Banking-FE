import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Settings, Users, HelpCircle, 
  BookOpen, DollarSign, ChevronRight 
} from 'lucide-react';
import Header from './Dashboard/Header';
import Sidebar from './Dashboard/Sidebar';
import Chatbot from './chatbot';
import FinancialAdvice from './FinancialAdvice';
import { useTranslation } from '../context/TranslationContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarMinimized, setSidebarMinimized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showChat, setShowChat] = useState(false);
  const isMobile = window.innerWidth < 1024;
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      navigate('/', { replace: true });
      return;
    }

    // Parse user data to make sure it's valid
    try {
      JSON.parse(userData);
    } catch (e) {
      localStorage.clear();
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dashboardCards = [
    {
      title: t.servicesOffered,
      icon: Settings,
      description: t.servicesDescription,
      color: 'from-blue-600 to-blue-700',
      path: '/services-offered'
    },
    {
      title: t.userDashboard,
      icon: Users,
      description: t.userDashboardDescription,
      color: 'from-blue-500 to-blue-600',
      path: '/user-dashboard'
    },
    {
      title: t.blogForum,
      icon: MessageSquare,
      description: t.blogDescription,
      color: 'from-blue-600 to-blue-700',
      path: '/blog-forum'
    },
    {
      title: t.support,
      icon: HelpCircle,
      description: t.supportDescription,
      color: 'from-blue-500 to-blue-600',
      path: '/support'
    },
    {
      title: t.rbiGuidelines,
      icon: BookOpen,
      description: t.rbiDescription,
      color: 'from-blue-600 to-blue-700',
      path: '/rbi-guidelines'
    },
    {
      title: t.pricingStructure,
      icon: DollarSign,
      description: t.pricingDescription,
      color: 'from-blue-500 to-blue-600',
      path: '/pricing-structure'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Sidebar 
        isOpen={isSidebarOpen}
        isMinimized={isSidebarMinimized}
        isMobile={isMobile}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      />

      <Header
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        toggleMinimize={() => setSidebarMinimized(!isSidebarMinimized)}
        isSidebarMinimized={isSidebarMinimized}
        isMobile={isMobile}
      />

      {/* Main Content Wrapper */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 
        ${isSidebarOpen ? (isSidebarMinimized ? 'lg:ml-24' : 'lg:ml-72') : ''}`}>
        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 mt-20">
          <div className="max-w-7xl mx-auto">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
              {dashboardCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => navigate(card.path)}
                  className="group relative bg-white/70 backdrop-blur-sm p-6 rounded-xl
                    border border-blue-100 shadow-sm hover:shadow-xl
                    transform transition-all duration-500 hover:-translate-y-1
                    animate-fadeUpIn text-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${card.color}
                      transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-600 opacity-0 transform translate-x-4
                      group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-700
                    transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </button>
              ))}
            </div>

            <FinancialAdvice />
          </div>
        </main>
      </div>

      {/* Chat Button and Modal */}
      <div className="fixed bottom-0 right-0 mb-20 mr-6 z-[9999] print:hidden">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 flex items-center justify-center
            bg-blue-600 text-white rounded-full shadow-lg 
            hover:bg-blue-700 transition-all duration-300
            animate-pulse-ring animate-bounce-subtle
            hover:scale-110 hover:animate-none
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {showChat && (
        <div className="fixed bottom-24 right-6 z-50">
          <Chatbot onClose={() => setShowChat(false)} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;