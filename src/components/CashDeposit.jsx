import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import SuccessPage from './SuccessPage';

const CashDeposit = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <DashboardLayout>
      {isSuccess ? (
        <SuccessPage 
          message="Cash deposit successful!"
          redirectPath="/dashboard"
          buttonText="Return to Dashboard"
        />
      ) : (
        // Your deposit form JSX here
        <div>
          {/* Deposit form content */}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CashDeposit;
