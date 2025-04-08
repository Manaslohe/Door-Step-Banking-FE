import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, Settings, BookOpen, 
  MessageSquare, DollarSign, HelpCircle,
  X, MenuIcon, Activity, Clock, FileText, Home
} from 'lucide-react';
import { useTranslation } from '../../context/TranslationContext';
import Logo from '../logo.svg';
import FeedbackPopup from './FeedbackPopup';  // Add this import

const Sidebar = ({ isOpen, isMinimized, isMobile, toggleSidebar }) => {
  const { t } = useTranslation();

  // Add fallback for navigation items
  const navigationItems = t?.navigation || {
    home: 'Home',
    userProfile: 'User Profile',
    servicesOffered: 'Banking Services',
    rbiGuidelines: 'RBI Guidelines',
    blogForum: 'Blog/Forum',
    pricingStructure: 'Pricing Structure',
    trackService: 'Track Service',
    trackTicket: 'Track Ticket',
    support: 'Support'
  };

  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  
  const navItems = [
    { path: '/dashboard', icon: Home, text: navigationItems.home },
    { path: '/user-dashboard', icon: Users, text: navigationItems.userProfile },
    { path: '/services-offered', icon: Settings, text: navigationItems.servicesOffered },
    { path: '/rbi-guidelines', icon: BookOpen, text: navigationItems.rbiGuidelines },
    { path: '/blog-forum', icon: MessageSquare, text: navigationItems.blogForum },
    { path: '/pricing-structure', icon: DollarSign, text: navigationItems.pricingStructure },
    { path: '/track-service', icon: Clock, text: t.tracking.service.title },
    { path: '/track-ticket', icon: FileText, text: t.tracking.ticket.title },
    { path: '/support', icon: HelpCircle, text: navigationItems.support }
  ];

  // Mobile-only: Hide completely when closed
  if (isMobile && !isOpen) return null;

  return (
    <div className="relative">
      {/* Backdrop with smooth fade */}
      {isMobile && (
        <div 
          className={`
            fixed inset-0 bg-gray-900/60 backdrop-blur-sm
            transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={toggleSidebar}
          style={{ zIndex: isMobile ? 40 : 20 }}
        />
      )}

      {/* Sidebar with improved transitions */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen
          ${isMobile ? 'w-[280px]' : (isMinimized ? 'w-24' : 'w-72')}
          bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800
          border-r border-blue-500/30 shadow-xl
          transform transition-all duration-300 ease-in-out
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        `}
        style={{ zIndex: isMobile ? 50 : 30 }}
      >
        <div className="p-4 h-full flex flex-col relative">
          {/* Header */}
          <div className={`
            flex items-center
            ${!isMobile && isMinimized ? 'justify-center' : 'justify-between'}
            mb-8 transition-all duration-300
          `}>
            <div className={`
              flex items-center gap-3
              ${!isMobile && isMinimized ? 'justify-center' : ''}
            `}>
              <div className={`
                bg-white/20 rounded-lg flex items-center justify-center
                ${!isMobile && isMinimized ? 'w-12 h-12' : 'w-10 h-10'}
                p-2
              `}>
                <img 
                  src={Logo} 
                  alt="Logo" 
                  className="w-full h-full object-contain filter brightness-0 invert" 
                />
              </div>
              {(!isMinimized || isMobile) && (
                <span className="text-2xl font-bold text-white/90">
                  Saral Banking
                </span>
              )}
            </div>
            {/* Only show close button on mobile */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-white/10 active:scale-95
                  transition-all duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Navigation with fixed mobile click handling */}
          <nav className={`
            flex-1 space-y-2 overflow-y-auto
            ${!isMobile && isMinimized ? 'flex flex-col items-center' : ''}
            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10
            hover:scrollbar-thumb-white/20 scroll-smooth
          `}>
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  if (isMobile) {
                    e.preventDefault();
                    toggleSidebar();
                    // Use setTimeout to wait for sidebar animation
                    setTimeout(() => {
                      navigate(item.path);
                    }, 300);
                  }
                }}
                className={({ isActive }) => `
                  flex items-center 
                  ${!isMobile && isMinimized ? 'justify-center w-14' : 'w-full'}
                  gap-4 px-3 py-3 rounded-xl
                  text-sm font-medium group
                  transform transition-all duration-200 ease-out
                  hover:scale-[1.02] active:scale-[0.98]
                  ${isActive ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10'}
                `}
              >
                <div className={`
                  ${!isMobile && isMinimized ? 'p-2.5' : 'p-2'} 
                  rounded-lg bg-white/10
                  transition-all duration-200 ease-out
                  group-hover:bg-white/15 group-hover:shadow-md
                `}>
                  <item.icon className="w-5 h-5 transition-transform duration-200 
                    group-hover:scale-110" />
                </div>
                {(!isMinimized || isMobile) && (
                  <span className="transition-transform duration-200 
                    group-hover:translate-x-1">
                    {item.text}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Replace support section with feedback button */}
          {(!isMinimized || isMobile) && (
            <div 
              onClick={() => setShowFeedback(true)}
              className="mt-auto p-4 bg-white/10 rounded-xl cursor-pointer
                transition-all duration-300 hover:bg-white/15"
            >
              <div className="text-white/80 text-sm flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <div>
                  <p className="font-medium mb-1">{t.menu.feedback.title}</p>
                  <p className="text-xs text-blue-100">{t.menu.feedback.subtitle}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Add Feedback Popup */}
      {showFeedback && (
        <FeedbackPopup onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
};

export default Sidebar;