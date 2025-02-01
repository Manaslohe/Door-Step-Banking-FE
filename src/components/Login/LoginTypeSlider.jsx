import React from 'react';
import { Shield, Users } from 'lucide-react';

const LoginTypeSlider = ({ activeType, onTypeChange }) => {
  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-full p-1 shadow-md">
      <div className="relative flex">
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-blue-500 rounded-full transition-transform duration-300 ease-in-out ${
            activeType === 'admin' ? 'translate-x-full' : ''
          }`}
        />
        <button
          onClick={() => onTypeChange('customer')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-full relative z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
            activeType === 'customer' ? 'text-white' : 'text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Customer
        </button>
        <button
          onClick={() => onTypeChange('admin')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-full relative z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
            activeType === 'admin' ? 'text-white' : 'text-gray-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          Admin
        </button>
      </div>
    </div>
  );
};

export default LoginTypeSlider;
