import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = ({ message, redirectPath, buttonText }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-green-100">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-2">
          {message || 'Transaction Successful!'}
        </h2>
        
        <p className="text-gray-600 mb-8">
          Your transaction has been processed successfully.
        </p>

        <button
          onClick={() => navigate(redirectPath || '/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          data-testid="success-button"
        >
          {buttonText || 'Back to Dashboard'}
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
