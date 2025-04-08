import React from 'react';
import { motion } from 'framer-motion';

const TaskDistribution = ({ serviceTypes, assignedTasks }) => {
  if (!serviceTypes || serviceTypes.length === 0 || !assignedTasks || assignedTasks.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-gray-500">No data available</p>
      </div>
    );
  }

  // Configuration for service type colors and icons
  const serviceConfig = {
    'CASH_DEPOSIT': { color: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-500', title: 'Cash Deposit' },
    'CASH_WITHDRAWAL': { color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-500', title: 'Cash Withdrawal' },
    'NEW_ACCOUNT': { color: 'bg-violet-500', gradient: 'from-violet-400 to-violet-500', title: 'New Account' },
    'DOCUMENT_SERVICE': { color: 'bg-amber-500', gradient: 'from-amber-400 to-amber-500', title: 'Document' },
    'LIFE_CERTIFICATE': { color: 'bg-rose-500', gradient: 'from-rose-400 to-rose-500', title: 'Life Cert.' },
    'ONLINE_ASSISTANCE': { color: 'bg-cyan-500', gradient: 'from-cyan-400 to-cyan-500', title: 'Assistance' }
  };

  return (
    <div className="mb-2">
      <div className="flex justify-center items-end space-x-2 h-20">
        {serviceTypes.map((type, idx) => {
          const count = assignedTasks.filter(t => t.serviceType === type).length;
          const percent = Math.round((count / assignedTasks.length) * 100);
          const config = serviceConfig[type] || { color: 'bg-gray-500', gradient: 'from-gray-400 to-gray-500', title: type };

          return (
            <div key={type} className="flex flex-col items-center">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(percent, 5)}%` }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group"
              >
                <div className={`w-6 rounded-t-md ${config.color}`} style={{ height: `${Math.max(percent, 5)}px` }}>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity w-max"
                  >
                    {percent}%
                  </motion.div>
                </div>
              </motion.div>
              <div className={`w-full h-0.5 bg-gradient-to-r ${config.gradient}`}></div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="text-xs font-medium mt-1 text-center max-w-[40px] truncate" 
                title={config.title}
              >
                {config.title}
              </motion.p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3">
        {serviceTypes.map((type) => {
          const config = serviceConfig[type] || { color: 'bg-gray-500', title: type };
          return (
            <div key={type} className="flex items-center text-xs">
              <div className={`w-2 h-2 rounded-full ${config.color} mr-1 flex-shrink-0`}></div>
              <span className="truncate text-gray-600">{config.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskDistribution;
