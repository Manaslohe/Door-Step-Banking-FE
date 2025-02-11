import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[60] animate-slide-left">
      <div className={`flex items-center space-x-2 p-4 rounded-lg shadow-lg border 
        ${type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
        <p className={type === 'success' ? 'text-green-700' : 'text-red-700'}>
          {message}
        </p>
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
