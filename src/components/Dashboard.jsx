import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Clock, 
  TrendingUp
} from 'lucide-react';
import Header from './Dashboard/Header';
import Sidebar from './Dashboard/Sidebar';
import Chatbot from './chatbot';
import FinancialAdvice from './FinancialAdvice';
import { useTranslation } from '../context/TranslationContext';
import { auth } from '../utils/auth';
import { tokenManager } from '../utils/tokenManager';
import logo from './logo.svg';  // Add this import at the top

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarMinimized, setSidebarMinimized] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [greeting, setGreeting] = useState('');
  const isMobile = window.innerWidth < 1024;
  const { t } = useTranslation();

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return t.greeting.morning;
      if (hour < 18) return t.greeting.afternoon;
      return t.greeting.evening;
    };
    setGreeting(getGreeting());
  }, [t]);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = auth.getToken();
        if (token) {
          tokenManager.setDashboardToken(token);
        }
        if (!auth.isSessionValid()) {
          auth.clearAuth();
          navigate('/', { replace: true });
          return;
        }
        const userData = auth.getUserData();
        if (!userData?._id) {
          throw new Error('Invalid user data');
        }
        auth.refreshSession();
        setIsLoading(false);
      } catch (error) {
        console.error('Dashboard session error:', error);
        auth.clearAuth();
        navigate('/', { replace: true });
      }
    };
    validateSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    { 
      icon: Clock, 
      title: t.stats.available.title,
      subtitle: t.stats.available.subtitle,
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      icon: Shield, 
      title: t.stats.secure.title,
      subtitle: t.stats.secure.subtitle,
      gradient: 'from-emerald-500 to-emerald-600'
    },
    { 
      icon: TrendingUp, 
      title: t.stats.fast.title,
      subtitle: t.stats.fast.subtitle,
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
        isSidebarOpen={isSidebarOpen} // Add this prop
      />

      <div className={`min-h-[calc(100vh-5rem)] transition-all duration-300 
        ${isSidebarOpen ? (isSidebarMinimized ? 'lg:ml-24' : 'lg:ml-72') : ''}
        lg:overflow-hidden overflow-auto`}>
        
        <main className="container mx-auto px-4 py-6 mt-16 lg:mt-20 max-w-7xl">
          {/* Welcome Card */}
          <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl mb-6 lg:mb-8 
            bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
            {/* Background Pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-blue-600 opacity-10">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute transform rotate-45 bg-white/5 rounded-full"
                    style={{
                      width: `${Math.random() * 300 + 100}px`,
                      height: `${Math.random() * 300 + 100}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative p-4 sm:p-6 lg:p-8">
              {/* Updated container structure */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left Section */}
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 flex-grow">
                  {/* Logo Container */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl
                    flex items-center justify-center shadow-xl flex-shrink-0 
                    border border-white/20 transition-all duration-300
                    hover:scale-105 hover:bg-white/15 p-2 sm:p-3">
                    <img 
                      src={logo} 
                      alt="Saral Bank Logo" 
                      className="w-full h-full object-contain filter brightness-0 invert"
                    />
                  </div>

                  {/* Welcome Text */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="text-white/90 text-base sm:text-lg font-medium">
                      {greeting},
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                      {t.welcomeBack} <span className="text-blue-200">{t.bankName}</span>
                    </h1>
                    <p className="text-blue-50 text-sm sm:text-base opacity-90">
                      {t.trustedPartner}
                    </p>
                    {/* Mobile-only button */}
                    <div className="block lg:hidden mt-4">
                      <button
                        onClick={() => navigate('/services-offered')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 
                          px-4 py-3 text-sm font-semibold text-blue-600
                          bg-white rounded-lg transition-all duration-300
                          hover:bg-blue-50 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                      >
                        <span>{t.exploreServices}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop-only button */}
                <div className="hidden lg:block flex-shrink-0">
                  <button
                    onClick={() => navigate('/services-offered')}
                    className="flex items-center justify-center gap-2 
                      px-6 py-4 text-base font-semibold text-blue-600
                      bg-white rounded-xl transition-all duration-300
                      hover:bg-blue-50 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  >
                    <span>{t.exploreServices}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-xl lg:rounded-2xl`} />
                <div className="relative bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 
                  shadow hover:shadow-lg transition-all duration-300 
                  border border-gray-100 hover:border-gray-200">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`p-2.5 lg:p-3 bg-gradient-to-br ${stat.gradient} 
                      rounded-lg lg:rounded-xl shadow
                      group-hover:scale-105 transition-transform duration-300`}>
                      <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg lg:text-xl font-bold text-gray-800">
                        {stat.title}
                      </div>
                      <div className="text-sm lg:text-base text-gray-600 font-medium">
                        {stat.subtitle}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Advice Section */}
          <div className="mb-6 lg:mb-0">
            <FinancialAdvice />
          </div>
        </main>
      </div>

      {/* Chatbot Button with modern gradient */}
      <div className="fixed bottom-0 right-0 mb-6 mr-6 z-30 print:hidden">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 flex items-center justify-center
            bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full 
            shadow-lg hover:shadow-xl transition-all duration-300     animate-pulse-ring 
            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Open chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* Chatbot Modal with glass effect */}
      {showChat && (
        <div className="fixed bottom-20 right-6 z-40">
          <div className="w-[400px] max-w-[calc(100vw-48px)] bg-white/80 backdrop-blur-xl
            rounded-3xl shadow-2xl border border-gray-100">
            <Chatbot onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;