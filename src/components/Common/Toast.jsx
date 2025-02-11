import React from 'react';
import { XCircle } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${getTypeStyles()}`}>
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
