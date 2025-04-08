import React from 'react';
import { Layout, Menu, User, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileHeader = ({ toggleSidebar, profile }) => (
  <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
    <div className="flex items-center space-x-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-200"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </motion.button>
      <div className="flex items-center">
        <Layout className="w-6 h-6 text-orange-600 mr-2" />
        <span className="font-bold text-lg">Agent Portal</span>
      </div>
    </div>
    
    <div className="flex items-center space-x-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 relative"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></span>
      </motion.button>
      
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <User className="w-4 h-4 text-orange-700" />
        </div>
      </div>
    </div>
  </div>
);

export default MobileHeader;
