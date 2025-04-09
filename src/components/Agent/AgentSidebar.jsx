import React, { useEffect } from 'react';
import {
  Layout,
  Users,
  FileText,
  Settings,
  LogOut,
  Activity,
  X,
  UserCircle,
  HelpCircle,
  PieChart,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import TaskDistribution from './components/TaskDistribution';
import { useNavigate } from 'react-router-dom';

const AgentSidebar = ({ agentProfile, handleLogout, sidebarOpen, closeSidebar, assignedTasks }) => {
  const navigate = useNavigate();
  
  // Get unique service types for the chart
  const serviceTypes = assignedTasks ? [...new Set(assignedTasks.map(task => task.serviceType))] : [];

  // Handle logout and navigation
  const handleLogoutAndNavigate = () => {
    handleLogout();
    navigate('/');
  };

  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);
  
  return (
    <motion.aside 
      className={`bg-white shadow-md z-50 ${sidebarOpen ? 'fixed inset-y-0 left-0 w-72' : 'hidden'} md:flex md:flex-col md:w-64 md:h-full`}
      initial={false}
      animate={{ x: sidebarOpen ? 0 : -300 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sidebar Header with Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-md">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-500">
                Agent Portal
              </span>
              <p className="text-xs text-gray-500">Service Runner</p>
            </div>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Agent Profile */}
      {agentProfile && (
        <div className="p-4 mb-2 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-2.5 rounded-full shadow-sm">
              <UserCircle className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{agentProfile.name || agentProfile.firstName || 'Agent'}</h3>
              <p className="text-xs text-gray-500">{agentProfile.email || agentProfile.userId}</p>
            </div>
          </div>
          {/* Active Services section removed */}
        </div>
      )}
      
      {/* Task Distribution Chart */}
      {assignedTasks && assignedTasks.length > 0 && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-800">Service Distribution</h4>
            </div>
            <TaskDistribution serviceTypes={serviceTypes} assignedTasks={assignedTasks} />
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Main Menu
            </h3>
          </div>
          
          {[
            { 
              icon: Activity, 
              text: 'Dashboard', 
              active: true,
              gradient: 'from-orange-500 to-orange-600'
            },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                item.active 
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-md` 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={closeSidebar}
            >
              <div className="flex items-center space-x-3">
                <div className={`${item.active ? 'bg-white/20' : 'bg-gray-100'} p-1.5 rounded-md`}>
                  <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span className={`${item.active ? 'font-medium' : ''}`}>{item.text}</span>
              </div>
              
              {item.active && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </motion.button>
          ))}
          
          {/* Preferences section removed */}
        </div>
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <motion.button
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogoutAndNavigate}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-1.5 rounded-md">
              <LogOut className="w-4 h-4 text-red-600" />
            </div>
            <span className="font-medium">Logout</span>
          </div>
          <ArrowRight className="w-4 h-4 opacity-70" />
        </motion.button>
      </div>
      
      {/* Footer */}
      <div className="p-4 text-center">
        <div className="text-xs text-gray-400">
          <p>DoorStep Banking App</p>
          <p>© 2023 All rights reserved</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default AgentSidebar;
