import React from 'react';
import { AlertCircle } from 'lucide-react';

const DashboardHeader = ({ agentProfile, error }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Welcome back, {agentProfile?.name?.split(' ')[0] || 'Agent'}
      </h1>
      <p className="text-gray-600">Manage your tasks and service requests efficiently.</p>
      
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-red-600 text-sm md:text-base">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
