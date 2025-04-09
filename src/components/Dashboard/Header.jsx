import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, User, Settings, LogOut, 
  Bell, PanelLeftClose, PanelLeftOpen,
  MinusSquare, PlusSquare,
  Loader2 // Add this import
} from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { EditUserModal } from '../Modals/EditUserModal';
import { useTranslation } from '../../context/TranslationContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { logout } from '../../services/api'; // Import the logout service

const Header = ({ 
  toggleSidebar, 
  toggleMinimize, 
  isSidebarMinimized, 
  isMobile,
  isSidebarOpen // Add this prop
}) => {
  const { t } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, setUser } = useUser(); // Destructure setUser from useUser hook
  const [fullName, setFullName] = useState('Loading...');

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
      setIsLoggingOut(true);
      await logout(); // Call the logout API endpoint
      localStorage.removeItem('userData'); // Clear user data from localStorage
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('userData');
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
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

  const handleSidebarToggle = () => {
    setIsAnimating(true);
    toggleSidebar();
    setTimeout(() => setIsAnimating(false), 300); // Match the animation duration
  };

  return (
    <header className={`bg-blue-700 shadow-lg px-4 lg:px-6 py-3 lg:py-4 fixed top-0 right-0 
      ${isMobile ? 'left-0' : isSidebarMinimized ? 'left-24' : 'left-72'}
      transition-all duration-300 ease-in-out z-40
    `}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Updated Mobile menu button with animation */}
          <button 
            onClick={handleSidebarToggle}
            className={`p-2 lg:p-2.5 rounded-lg hover:bg-white/10 active:bg-white/20
              transition-all duration-200 relative overflow-hidden
              ${isMobile ? '' : 'hidden'}
            `}
            disabled={isAnimating}
          >
            <div className={`transform transition-all duration-300 ease-in-out
              ${isAnimating ? 'scale-90' : 'scale-100'}
            `}>
              {isSidebarOpen ? (
                <PanelLeftClose className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              ) : (
                <PanelLeftOpen className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              )}
            </div>
          </button>
          
          {/* Desktop sidebar minimize button with animation */}
          {!isMobile && (
            <button 
              onClick={toggleMinimize}
              className="p-2.5 rounded-lg hover:bg-white/10 active:bg-white/20
                transition-all duration-300 hidden lg:block group"
            >
              {isSidebarMinimized ? (
                <PanelLeftOpen 
                  className="w-7 h-7 text-white transform transition-transform 
                    duration-300 group-hover:scale-110" 
                />
              ) : (
                <PanelLeftClose 
                  className="w-7 h-7 text-white transform transition-transform 
                    duration-300 group-hover:scale-110" 
                />
              )}
            </button>
          )}

          {/* Divider - Only show if back button is visible */}
          {!location.pathname.endsWith('/dashboard') && (
            <div className="h-8 w-[2px] bg-white/20 mx-2 hidden lg:block" />
          )}

          {/* Back Button - Only show if not on dashboard */}
          {!location.pathname.endsWith('/dashboard') && (
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 lg:gap-2 text-white hover:text-white/90 
                group transition-colors px-2 lg:px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm lg:text-base font-medium">{t?.back || 'Back'}</span>
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-6">
          {/* Language switcher - Visible on all screen sizes */}
          <div className="scale-110">
            <LanguageSwitcher />
          </div>
          
          {/* Profile Section */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 lg:gap-4 hover:bg-white/10 p-2 rounded-lg
                transition-all duration-200 group"
            >
              {!loading && user && user.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt="Profile"
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 rounded-full flex items-center 
                  justify-center border-2 border-white/20">
                  <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              )}
              <span className="text-white text-sm lg:text-base font-medium hidden sm:block">
                {fullName}
              </span>
            </button>

            {/* Profile Dropdown - Improved Animation */}
            <div className={`absolute right-0 mt-2 w-48 lg:w-64 bg-white rounded-xl
              shadow-xl border border-gray-100 transition-all duration-200
              origin-top-right transform
              ${isProfileOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
            `}>
              <div className="py-2">
                <button 
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left
                    transition-colors duration-150"
                >
                  <User className="w-5 h-5" />
                  <span className="text-base">{t.profile}</span>
                </button>
                
                {/* Admin settings button */}
                {user?.userType === 'admin' && (
                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left
                      transition-colors duration-150"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-base">{t.settings}</span>
                  </button>
                )}
                
                <hr className="my-2" />

                {/* Logout button with loading state */}
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left 
                    text-red-600 transition-colors duration-150"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-base">Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5" />
                      <span className="text-base">{t.logout}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
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