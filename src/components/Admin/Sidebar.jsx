// Sidebar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout, Users, LogOut, Activity,
  User, ChevronDown
} from 'lucide-react';
import AdminProfile from './AdminProfile';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

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
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <>
      <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
        <div className="p-4 sm:p-6 bg-blue-600">
          <div className="flex items-center space-x-3 ">
            <Layout className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
        </div>

        {/* Admin Profile Section */}
        <div className="p-4 border-b bg-gray-50 relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-700">{adminUser.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{adminUser.email || 'admin@email.com'}</p>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'transform rotate-180' : ''}`} />
          </button>
          
          {showProfileMenu && (
            <div className="absolute left-4 right-4 top-[85%] bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-2 w-[calc(100%-2rem)]">
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                View Profile
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.text}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <AdminProfile onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
