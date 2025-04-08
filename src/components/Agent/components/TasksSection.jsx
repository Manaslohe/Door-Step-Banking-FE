import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Filter, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import TaskCard from '../TaskCard';

const TasksSection = ({
  showCompletedTasks,
  setShowCompletedTasks,
  showFilters,
  setShowFilters,
  filterType,
  setFilterType,
  refreshData,
  refreshing,
  loading,
  tasksToDisplay,
  serviceTypes,
  formatDateTime,
  formatPhoneNumber,
  getStatusColor,
  getServiceIcon
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mt-6"
    >
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-5">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {showCompletedTasks ? 'Completed Tasks' : 'Active Tasks'}
            </h2>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCompletedTasks(!showCompletedTasks)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {showCompletedTasks ? 'Show Active' : 'Show Completed'}
            </motion.button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
              >
                <Filter className="w-4 h-4 mr-1" />
                <span>Filter</span>
                {showFilters ? 
                  <ChevronUp className="w-4 h-4 ml-1" /> : 
                  <ChevronDown className="w-4 h-4 ml-1" />
                }
              </motion.button>
              
              {/* Filter Dropdown */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10"
                  >
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-500">SERVICE TYPE</p>
                      <button
                        onClick={() => {
                          setFilterType('all');
                          setShowFilters(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm rounded-md ${
                          filterType === 'all' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'
                        }`}
                      >
                        All Services
                      </button>
                      {serviceTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setFilterType(type);
                            setShowFilters(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm rounded-md ${
                            filterType === type ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'
                          }`}
                        >
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={refreshing}
              className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
        </div>

        {/* Filter indicators */}
        {filterType !== 'all' && (
          <div className="mb-4 flex items-center">
            <span className="text-sm text-gray-600 mr-2">Filtered by:</span>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              {filterType.replace('_', ' ')}
              <button 
                onClick={() => setFilterType('all')}
                className="ml-1 hover:text-orange-900"
              >
                ×
              </button>
            </span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500">Loading your tasks...</p>
          </div>
        ) : tasksToDisplay.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-10 text-center">
            <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-700 text-lg mb-2">
              {showCompletedTasks 
                ? "No Completed Tasks" 
                : "No Active Tasks"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {showCompletedTasks 
                ? "You haven't completed any tasks yet. Tasks will appear here once you mark them as completed."
                : filterType !== 'all' 
                  ? `No ${filterType.replace('_', ' ')} tasks available. Try changing the filter.`
                  : "You don't have any active tasks assigned at the moment. Check back later or contact your supervisor."}
            </p>
            
            {filterType !== 'all' && (
              <button
                onClick={() => setFilterType('all')}
                className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {tasksToDisplay.map((task, index) => (
                <TaskCard 
                  key={task.id || index}
                  task={task}
                  index={index}
                  showCompletedTasks={showCompletedTasks}
                  getStatusColor={getStatusColor}
                  getServiceIcon={getServiceIcon}
                  formatPhoneNumber={formatPhoneNumber}
                  formatDateTime={formatDateTime}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TasksSection;
