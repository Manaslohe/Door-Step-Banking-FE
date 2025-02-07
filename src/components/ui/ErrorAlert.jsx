import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default ErrorAlert;
