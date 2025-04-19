import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TaskDistribution = ({ serviceTypes, assignedTasks }) => {
  const [showModal, setShowModal] = useState(false);
  
  if (!serviceTypes || serviceTypes.length === 0 || !assignedTasks || assignedTasks.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-gray-500">No data available</p>
      </div>
    );
  }

  // Configuration for service type colors and icons - ensuring all colors are unique
  const serviceConfig = {
    'CASH_WITHDRAWAL': { color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-500', title: 'Cash Withdrawal', shortTitle: 'Cash W.' },
    'LIFE_CERTIFICATE': { color: 'bg-rose-500', gradient: 'from-rose-400 to-rose-500', title: 'Life Certificate', shortTitle: 'Life C.' },
    'NEW_ACCOUNT': { color: 'bg-violet-500', gradient: 'from-violet-400 to-violet-500', title: 'New Account', shortTitle: 'New A.' },
    'DOCUMENT_COLLECTION': { color: 'bg-gray-500', gradient: 'from-gray-400 to-gray-500', title: 'Document Collection', shortTitle: 'Doc C.' },
    'CASH_DEPOSIT': { color: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-500', title: 'Cash Deposit', shortTitle: 'Cash D.' },
    'DOCUMENT_DELIVERY': { color: 'bg-amber-500', gradient: 'from-amber-400 to-amber-500', title: 'Document Delivery', shortTitle: 'Doc D.' }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    // Making the entire container clickable
    <div className="mb-2 relative border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={openModal}>
      {/* Title section */}
      <div className="flex items-center mb-3 text-blue-600">

      </div>
      
      {/* Graph section */}
      <div className="flex justify-between items-end h-20 w-full px-1">
        {serviceTypes.map((type, idx) => {
          const count = assignedTasks.filter(t => t.serviceType === type).length;
          const percent = Math.round((count / assignedTasks.length) * 100);
          const config = serviceConfig[type] || { color: 'bg-cyan-500', gradient: 'from-cyan-400 to-cyan-500', title: type, shortTitle: type.substring(0, 3) };

          return (
            <div key={type} className="flex flex-col items-center" style={{ width: `${100 / serviceTypes.length}%` }}>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(percent, 5)}%` }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group w-full flex justify-center"
              >
                <div 
                  className={`w-5 rounded-t-md ${config.color}`} 
                  style={{ height: `${Math.max(percent, 5)}px` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {percent}%
                  </div>
                </div>
              </motion.div>
              <div className={`w-full h-0.5 bg-gradient-to-r ${config.gradient}`}></div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="text-xs font-medium mt-1 text-center" 
                title={config.title}
              >
                {config.shortTitle}
              </motion.p>
            </div>
          );
        })}
      </div>

      {/* Legend with dots */}
      <div className="grid grid-cols-3 gap-x-1 gap-y-1 mt-2">
        {serviceTypes.map((type) => {
          const config = serviceConfig[type] || { color: 'bg-cyan-500', title: type, shortTitle: type.substring(0, 3) };
          return (
            <div key={type} className="flex items-center text-xs">
              <div className={`w-2 h-2 rounded-full ${config.color} mr-1 flex-shrink-0`}></div>
              <span className="truncate text-gray-600">{config.shortTitle}</span>
            </div>
          );
        })}
      </div>
      
      {/* Modal for expanded view */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={closeModal}>
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Service Distribution Details</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-between items-end h-64 mb-12">
              {serviceTypes.map((type, idx) => {
                const count = assignedTasks.filter(t => t.serviceType === type).length;
                const percent = Math.round((count / assignedTasks.length) * 100);
                const config = serviceConfig[type] || { color: 'bg-cyan-500', gradient: 'from-cyan-400 to-cyan-500', title: type };

                return (
                  <div key={type} className="flex flex-col items-center mx-4" style={{ width: `${100 / serviceTypes.length}%`, maxWidth: '120px' }}>
                    <div className="text-center mb-2 font-medium text-lg">
                      {percent}%
                    </div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(percent, 5)}%` }}
                      transition={{ duration: 0.5 }}
                      className="w-full flex justify-center"
                    >
                      <div 
                        className={`w-16 rounded-t-md ${config.color}`} 
                        style={{ height: `${Math.max(percent, 5)}px` }}
                      />
                    </motion.div>
                    <div className={`w-full h-1 bg-gradient-to-r ${config.gradient}`}></div>
                    <div className="h-20 flex flex-col items-center justify-start mt-2">
                      <p className="text-sm font-medium text-center break-words w-full">
                        {config.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {count} {count === 1 ? 'task' : 'tasks'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={closeModal}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-8 rounded text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDistribution;
