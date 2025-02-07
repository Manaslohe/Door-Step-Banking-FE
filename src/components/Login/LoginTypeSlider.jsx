import React from 'react';
import { Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginTypeSlider = ({ activeType, onTypeChange }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative flex">
        <motion.div
          layout
          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl"
          animate={{
            x: activeType === 'admin' ? '100%' : '0%',
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <button
          onClick={() => onTypeChange('customer')}
          className={`flex-1 py-3 px-6 rounded-xl relative z-10 transition-all duration-300 
            ${activeType === 'customer' ? 'text-white scale-105' : 'text-gray-700 hover:text-blue-600'}`}
        >
          <div className="flex items-center justify-center gap-3">
            <Users className={`w-5 h-5 ${activeType === 'customer' ? 'animate-bounce' : ''}`} />
            <span className="font-medium">Customer</span>
          </div>
        </button>
        <button
          onClick={() => onTypeChange('admin')}
          className={`flex-1 py-3 px-6 rounded-xl relative z-10 transition-all duration-300 
            ${activeType === 'admin' ? 'text-white scale-105' : 'text-gray-700 hover:text-blue-600'}`}
        >
          <div className="flex items-center justify-center gap-3">
            <Shield className={`w-5 h-5 ${activeType === 'admin' ? 'animate-bounce' : ''}`} />
            <span className="font-medium">Banker</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LoginTypeSlider;
