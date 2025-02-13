import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2 as Bank,
  UserPlus, 
  UserCheck,
  Shield,
  UserCog
} from 'lucide-react';
import QuoteBar from './Login/QuoteBar';
import NewsTicker from './Login/NewsTicker';
import RegisterTransition from './Login/RegisterTransition';
import LoginTypeSlider from './Login/LoginTypeSlider';
import LoginModal from './shared/LoginModal';
import CustomerLogin from './Login/CustomerLogin';
import AdminLogin from './Admin/AdminLogin';
import AgentLogin from './Agent/AgentLogin';
import { auth } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './shared/LoadingScreen';
import logo from './logo.svg';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterTransition, setShowRegisterTransition] = useState(false);
  const [loginType, setLoginType] = useState('customer');
  const [activeLoginType, setActiveLoginType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLoginModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const checkAuth = () => {
      if (auth.isSessionValid()) {
        const userData = auth.getUserData();
        if (userData?._id) {
          navigate('/dashboard', { replace: true });
        }
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = (type) => {
    setActiveLoginType(type);
    setShowLoginModal(true);
  };

  const handleNewUserClick = () => {
    setShowRegisterTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate('/register', { state: { fromTransition: true } });
  };

  const cardVariants = {
    initial: {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: 'blur(10px)',
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 1, 1]
      }
    }
  };

  const containerVariants = {
    initial: {
      backgroundColor: 'rgba(255, 255, 255, 0)',
    },
    animate: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const mainContentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 2,
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const renderLoginButtons = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={loginType}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {loginType === 'customer' ? (
            <>
              <motion.button
                variants={cardVariants}
                onClick={handleNewUserClick}
                className="bg-white/95 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 
                  border-2 border-blue-200 hover:border-blue-400 group backdrop-blur-sm min-h-[200px] md:min-h-[240px]"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <UserPlus className="w-16 h-16 md:w-20 md:h-20 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div className="text-center w-full">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5">New Customer</h3>
                    <p className="text-base md:text-lg text-gray-700 font-medium truncate px-2">
                      Create a new account with us
                    </p>
                  </div>
                </div>
              </motion.button>
              
              <motion.button
                variants={cardVariants}
                onClick={() => handleLoginClick('customer')}
                className="bg-white/95 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 
                  border-2 border-green-200 hover:border-green-400 group backdrop-blur-sm min-h-[200px] md:min-h-[240px]"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <UserCheck className="w-16 h-16 md:w-20 md:h-20 text-green-600 group-hover:scale-110 transition-transform" />
                  <div className="text-center w-full">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5">Existing Customer</h3>
                    <p className="text-base md:text-lg text-gray-700 font-medium truncate px-2">
                      Sign in to your account
                    </p>
                  </div>
                </div>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                variants={cardVariants}
                onClick={() => handleLoginClick('admin')}
                className="bg-white/95 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 
                  border-2 border-purple-200 hover:border-purple-400 group backdrop-blur-sm min-h-[200px] md:min-h-[240px]"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Shield className="w-16 h-16 md:w-20 md:h-20 text-purple-600 group-hover:scale-110 transition-transform" />
                  <div className="text-center w-full">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5">Banker Portal</h3>
                    <p className="text-base md:text-lg text-gray-700 font-medium truncate px-2">
                      Access banking controls
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                variants={cardVariants}
                onClick={() => handleLoginClick('agent')}
                className="bg-white/95 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 
                  border-2 border-orange-200 hover:border-orange-400 group backdrop-blur-sm min-h-[200px] md:min-h-[240px]"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <UserCog className="w-16 h-16 md:w-20 md:h-20 text-orange-600 group-hover:scale-110 transition-transform" />
                  <div className="text-center w-full">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5">Runner Portal</h3>
                    <p className="text-base md:text-lg text-gray-700 font-medium truncate px-2">
                      Access service portal
                    </p>
                  </div>
                </div>
              </motion.button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderLoginComponent = () => {
    switch (activeLoginType) {
      case 'admin': return <AdminLogin onClose={() => setShowLoginModal(false)} />;
      case 'agent': return <AgentLogin onClose={() => setShowLoginModal(false)} />;
      case 'customer': return <CustomerLogin onClose={() => setShowLoginModal(false)} />;
      default: return null;
    }
  };

  if (showRegisterTransition) {
    return <RegisterTransition onComplete={handleTransitionComplete} />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      
      <motion.div 
        className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50"
        initial="hidden"
        animate="visible"
        variants={mainContentVariants}
      >
        <motion.div 
          className="h-[12vh] min-h-[80px] max-h-[100px] shrink-0"
          variants={itemVariants}
        >
          <QuoteBar />
        </motion.div>
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center relative">
          <motion.div 
            className="text-center mb-6 md:mb-8 mt-4 md:mt-0"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center space-x-3 sm:space-x-4 mb-3">
              <div className="relative flex items-center">
                <img 
                  src={logo} 
                  alt="SaralBank Logo" 
                  className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-20 pt-1 object-contain"
                  style={{ filter: 'invert(27%) sepia(97%) saturate(1742%) hue-rotate(206deg) brightness(97%) contrast(101%)' }}
                />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Saral Banking
                </span>
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
              Banking Services at Your Doorstep
            </p>
          </motion.div>

          <motion.div 
            className="mb-6 md:mb-8"
            variants={itemVariants}
          >
            <LoginTypeSlider 
              activeType={loginType}
              onTypeChange={setLoginType}
            />
          </motion.div>

          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <div className="max-w-5xl mx-auto">
              {renderLoginButtons()}
            </div>
          </motion.div>
        </main>
        
        <motion.div 
          className="h-[8vh] min-h-[40px] max-h-[60px] shrink-0"
          variants={itemVariants}
        >
          <NewsTicker />
        </motion.div>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => {
            setShowLoginModal(false);
            setActiveLoginType(null);
          }}
          type={activeLoginType || loginType}
        >
          {renderLoginComponent()}
        </LoginModal>
      </motion.div>
    </>
  );
};

export default LandingPage;