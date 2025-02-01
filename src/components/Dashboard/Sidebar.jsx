import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, Settings, BookOpen, 
  MessageSquare, DollarSign, HelpCircle,
  X, MenuIcon, Activity, Clock, FileText, Home
} from 'lucide-react';
import { useTranslation } from '../../context/TranslationContext';

const Sidebar = ({ isOpen, isMinimized, isMobile, toggleSidebar }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { path: '/user-dashboard', icon: Users, text: t.userDashboard },
    { path: '/services-offered', icon: Settings, text: t.servicesOffered },
    { path: '/rbi-guidelines', icon: BookOpen, text: t.rbiGuidelines },
    { path: '/blog-forum', icon: MessageSquare, text: t.blogForum },
    { path: '/pricing-structure', icon: DollarSign, text: t.pricingStructure },
    { path: '/support', icon: HelpCircle, text: t.support },
    { path: '/track-service', icon: Clock, text: 'Track Service' }, // Added track service
  ];

  if (!isOpen && isMobile) return null;

  return (
    <div className={`
      ${isMobile ? 'fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50' : 'relative'}
      ${!isOpen && isMobile ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      transition-all duration-300
    `}>
      <div className={`
        ${isMinimized ? 'w-24' : 'w-72'}
        h-screen bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800
        fixed left-0 top-0 
        transform ${!isOpen && isMobile ? '-translate-x-full' : 'translate-x-0'}
        border-r border-blue-500/30 shadow-xl
        transition-[width,transform] duration-300 ease-in-out
      `}>
        <div className="p-4 overflow-hidden">
          <div className={`
            flex items-center justify-between mb-8
            ${isMinimized ? 'justify-center' : ''}
            transition-all duration-300
          `}>
            <div className={`
              flex items-center gap-3
              ${isMinimized ? 'justify-center' : ''}
              transition-all duration-300
            `}>
              <span className={`
                bg-white/20 rounded-lg flex items-center justify-center
                transition-all duration-300
                ${isMinimized ? 'w-12 h-12' : 'w-8 h-8'}
              `}>
                <span className={`
                  text-white font-bold transition-all duration-300
                  ${isMinimized ? 'text-2xl' : 'text-xl'}
                `}>
                  D
                </span>
              </span>
              {!isMinimized && (
                <span className="animate-fadeSlide text-2xl font-bold text-white/90">
                  {t.dashboard}
                </span>
              )}
            </div>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-3 rounded-lg hover:bg-blue-50 hover:scale-105
                  active:scale-95 transition-all duration-200"
              >
                <X className="w-7 h-7 text-blue-600" />
              </button>
            )}
          </div>
          <nav className={`
            space-y-2 
            ${isMinimized ? 'flex flex-col items-center' : ''} 
            transition-all duration-300
          `}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${isMinimized ? 'justify-center w-14' : 'w-full'} 
                   gap-4 px-3 py-3 rounded-xl
                   text-sm font-medium group
                   transition-all duration-300 ease-in-out
                   hover:scale-[1.02] hover:shadow-lg
                   ${isActive
                    ? 'bg-white/15 text-white relative'
                    : 'text-blue-100 hover:bg-white/10'
                   }
                   ${isMinimized ? 'mx-auto' : ''}`
                }
              >
                <div className={`
                  ${isMinimized ? 'p-2.5' : 'p-2'} 
                  rounded-lg bg-white/10
                  transition-all duration-300 ease-in-out
                  group-hover:bg-white/15 group-hover:shadow-md
                  relative z-10
                `}>
                  <item.icon className={`
                    w-5 h-5
                    transition-transform duration-300
                    ${isMinimized ? 'scale-110' : 'scale-100'}
                  `} />
                </div>
                {!isMinimized && (
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {item.text}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {!isMinimized && (
            <div className="mt-8 p-4 bg-white/10 rounded-xl transition-opacity duration-300">
              <div className="text-white/80 text-sm">
                <p className="font-medium mb-1">{t.support}</p>
                <p className="text-xs text-blue-100">{t.supportDescription}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {isMobile && (
        <div 
          className="fixed inset-0 z-40 transition-opacity duration-300 ease-in-out"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Sidebar;
