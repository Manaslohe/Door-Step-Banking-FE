// Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout, Users, LogOut, Activity,
  Ticket, Shield
} from 'lucide-react';

const Sidebar = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      icon: Activity, 
      text: 'Dashboard', 
      path: '/admin/dashboard',
      badge: '3'
    },
    { 
      icon: Users, 
      text: 'Manage Agents', 
      path: '/admin/manage-agents',
      badge: 'New'
    },
    {
      icon: Ticket,
      text: 'Track Tickets',
      path: '/admin/ticket-tracker',
      badge: 'Live'
    },
    {
      icon: Shield,
      text: 'Fraud Detection',
      path: '/admin/fraud-detection',
      badge: 'New'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <div className={`bg-gradient-to-b from-white to-gray-50 shadow-lg border-r border-gray-200 h-screen fixed left-0 top-0 z-20 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 -ml-64 lg:ml-0 lg:w-64'}`}>
      <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center space-x-3">
        <Layout className="w-8 h-8 text-white" />
        <span className="text-xl font-bold text-white tracking-wide">Admin Panel</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-sm
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="font-medium">{item.text}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${isActive ? 'bg-blue-200 text-blue-800' : item.badge === 'Live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 absolute bottom-0 w-full">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 hover:shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
