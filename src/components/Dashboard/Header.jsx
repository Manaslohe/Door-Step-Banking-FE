import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, User, Settings, LogOut, 
  Bell, Menu, MinusSquare, PlusSquare
} from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { EditUserModal } from '../Modals/EditUserModal';
import { useTranslation } from '../../context/TranslationContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { logout } from '../../services/api'; // Import the logout service

const Header = ({ toggleSidebar, toggleMinimize, isSidebarMinimized, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, setUser } = useUser(); // Destructure setUser from useUser hook
  const [fullName, setFullName] = useState('Loading...');
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading) {
      if (error) {
        setFullName('Error loading user');
        console.error('User loading error:', error);
        return;
      }
      
      if (user) {
        console.log('Setting user name from:', user);
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        setFullName(name || 'User');
      } else {
        setFullName('User');
      }
    }
  }, [user, loading, error]);

  // Debug log
  useEffect(() => {
    console.log('Current state:', { user, loading, error, fullName });
  }, [user, loading, error, fullName]);

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout API endpoint
      localStorage.removeItem('userData'); // Clear user data from localStorage
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('userData');
      navigate('/', { replace: true });
    }
  };

  const handleUserUpdate = async (updatedUser) => {
    try {
      setUser(updatedUser); // Update user state using the setUser from useUser hook
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  // If no user data and not loading, redirect to login
  useEffect(() => {
    if (!loading && !user && !error) {
      navigate('/', { replace: true });
    }
  }, [user, loading, error, navigate]);

  const handleBack = () => {
    navigate(-1); // This will take the user to the previous page
  };

  // Check if we're on the main dashboard page
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <header className={`bg-blue-700 shadow-lg px-6 py-4 fixed top-0 right-0 
      ${isMobile ? 'left-0' : isSidebarMinimized ? 'left-24' : 'left-72'}
      transition-all duration-300 ease-in-out z-40
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button 
            onClick={toggleSidebar}
            className={`p-2.5 rounded-lg hover:bg-white/10 active:bg-white/20
              transition-all duration-200
              ${isMobile ? '' : 'hidden'}
            `}
          >
            <Menu className="w-7 h-7 text-white" />
          </button>
          
          {/* Minimize sidebar button */}
          {!isMobile && (
            <button 
              onClick={toggleMinimize}
              className="p-2.5 rounded-lg hover:bg-white/10 active:bg-white/20
                transition-colors"
            >
              {isSidebarMinimized 
                ? <PlusSquare className="w-7 h-7 text-white" />
                : <MinusSquare className="w-7 h-7 text-white" />
              }
            </button>
          )}

          <div className="h-8 w-[2px] bg-white/20 mx-2" />

          {/* Back and Dashboard buttons */}
          <div className="flex items-center gap-3">
            {!isDashboardPage && (
              <>
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-white hover:text-white/90 
                    group transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-base font-medium hidden md:inline">{t.back}</span>
                </button>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-white hover:text-white/90 
                    transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  <span className="text-base font-medium">{t.dashboard}</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Language switcher */}
          <div className="scale-110">
            <LanguageSwitcher />
          </div>
          
          {/* Notification button */}
          <button className="p-2.5 hover:bg-white/10 rounded-lg relative
            transition-colors">
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-400 rounded-full
              animate-pulse"></span>
          </button>

          {/* Profile section */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-4 hover:bg-white/10 p-2 rounded-lg
                transition-colors group"
            >
              {!loading && user && user.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center 
                  justify-center border-2 border-white/20">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-white text-lg font-medium">
                {fullName}
              </span>
            </button>

            {/* Profile dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl
                shadow-xl py-2 animate-fadeIn border border-gray-100"
              >
                <button 
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left"
                >
                  <User className="w-5 h-5" />
                  <span className="text-base">{t.profile}</span>
                </button>
                
                {/* Only show settings for admin users */}
                {user?.userType === 'admin' && (
                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-base">{t.settings}</span>
                  </button>
                )}
                
                <hr className="my-2" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-base">{t.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EditUserModal */}
      {isEditModalOpen && (
        <EditUserModal
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUserUpdate}
        />
      )}
    </header>
  );
};

export default Header;
