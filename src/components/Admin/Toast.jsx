import React from 'react';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Toast = ({ message, type, onClose }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 border ${getTypeStyles()}`}
    >
      <span className="font-medium">{message}</span>
      <button 
        onClick={onClose} 
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default Toast;
