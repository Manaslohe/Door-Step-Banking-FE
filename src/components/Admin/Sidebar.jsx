// Sidebar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Users,
  LogOut,
  Activity,
  User,
  ChevronDown,
} from 'lucide-react';
import AdminProfile from './AdminProfile';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const menuItems = [
    { icon: Activity, text: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, text: 'Manage Agents', path: '/admin/manage-agents' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <>
      <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <Layout className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
        </div>

        {/* Admin Profile Section */}
        <div className="p-4 border-b relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-700">{adminUser.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{adminUser.email || 'admin@email.com'}</p>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'transform rotate-180' : ''}`} />
          </button>
          
          {showProfileMenu && (
            <div className="absolute left-4 right-4 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-2">
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                View Profile
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.text}</span>
                </button>
              );
            })}
          </div>
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
