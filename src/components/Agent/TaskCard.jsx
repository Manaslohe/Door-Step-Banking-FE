import React, { useState, useEffect } from 'react';
import { UserCircle, MapPin, Calendar, ArrowRight, IndianRupeeIcon, FileText, CheckCircle, Activity, ChevronDown, ChevronUp, Clock, User, CreditCard, Building, AlignJustify } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceDetailModal from './ServiceDetailModal';
import AcceptServiceModal from './AcceptServiceModal';
import OTPVerificationModal from './OTPVerificationModal';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ 
  task, 
  index, 
  showCompletedTasks, 
  getStatusColor, 
  getServiceIcon, 
  formatPhoneNumber, 
  formatDateTime 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('TaskCard rendering with task data:', task);
    console.log('Task address:', task.address);
    console.log('Service details:', task.serviceDetails);
  }, [task]);
  
  const iconType = getServiceIcon(task.serviceName);
  
  const getAddress = () => {
    if (task.address) return task.address;
    if (task.serviceDetails?.address) return task.serviceDetails.address;
    return task.location || 'No address provided';
  };

  const getCustomerName = () => {
    if (task.customerName) return task.customerName;
    if (task.serviceDetails?.userName) return task.serviceDetails.userName;
    return 'Customer';
  };
  
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeSlot = () => {
    if (task.timeSlot) return task.timeSlot;
    if (task.serviceDetails?.timeSlot) return task.serviceDetails.timeSlot;
    return null;
  };
  
  const renderIcon = () => {
    switch (iconType) {
      case 'dollar':
        return <IndianRupeeIcon className="w-6 h-6 text-amber-500" />;
      case 'file':
        return <FileText className="w-6 h-6 text-indigo-500" />;
      case 'check':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'activity':
      default:
        return <Activity className="w-6 h-6 text-violet-500" />;
    }
  };

  const handleNavigateToService = () => {
    navigate('/agent/service/navigate', {
      state: {
        service: task,
        destination: getAddress()
      }
    });
  };
  
  const handleStartService = () => {
    setShowOtpModal(true);
  };

  const handleOtpVerified = () => {
    setShowOtpModal(false);
    setShowAcceptModal(true);
  };
  
  const isCompleted = 
    task.status === 'completed' || 
    task.status === 'COMPLETED' || 
    (task.assignmentDetails && task.assignmentDetails.status === 'COMPLETED');
  
  const isPending = 
    task.status === 'pending' || 
    task.status === 'ASSIGNED' || 
    (task.assignmentDetails && task.assignmentDetails.status === 'ASSIGNED');
  
  const isInProgress = 
    task.status === 'in_progress' || 
    task.status === 'IN_PROGRESS' || 
    (task.assignmentDetails && task.assignmentDetails.status === 'IN_PROGRESS');
  
  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        <div className="p-5">
          {/* Header Section */}
          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded-xl shadow-sm">
                {renderIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg tracking-tight">{task.serviceName || 'Service Request'}</h3>
                <div className="mt-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-500 mr-1.5" />
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-2.5 py-1 inline-flex items-center shadow-sm">
                      <span className="text-xs text-blue-700 font-medium mr-2">
                        {formatDateOnly(task.scheduledTime || task.date)}
                      </span>
                      {getTimeSlot() && (
                        <>
                          <span className="text-gray-400 mx-1.5">|</span>
                          <span className="text-xs text-indigo-700 font-medium">
                            {getTimeSlot()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span className={`px-3.5 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
              isCompleted ? 'bg-green-100 text-green-800' : getStatusColor(task.status)
            }`}>
              {isCompleted ? 'Completed' : 
                isInProgress ? 'In Progress' : 
                isPending ? 'Pending' :
                task.status.charAt(0).toUpperCase() + task.status.slice(1).toLowerCase()}
            </span>
          </div>
          
          {/* Info Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-5">
            {task.customerPhone && (
              <div className="flex items-center p-2.5 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                <UserCircle className="w-4 h-4 text-gray-600 mr-2.5 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{formatPhoneNumber(task.customerPhone)}</span>
              </div>
            )}
            
            <div className="flex items-center p-2.5 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
              <MapPin className="w-4 h-4 text-gray-600 mr-2.5 flex-shrink-0" />
              <span className="text-gray-800 font-medium truncate" title={getAddress()}>{getAddress()}</span>
            </div>
            
            {getCustomerName() !== 'Customer' && (
              <div className="flex items-center p-2.5 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                <User className="w-4 h-4 text-gray-600 mr-2.5 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{getCustomerName()}</span>
              </div>
            )}
            
            {(task.amount > 0 || (task.serviceDetails?.amount > 0)) && (
              <div className="flex items-center p-2.5 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                <IndianRupeeIcon className="w-4 h-4 text-gray-600 mr-2.5 flex-shrink-0" />
                <span className="text-gray-800 font-medium">₹{(task.amount || task.serviceDetails?.amount || 0).toLocaleString()}</span>
              </div>
            )}
            
            {console.log('Rendering address/location in TaskCard:', 
              { hasAddress: !!task.address, address: task.address, 
                hasLocation: !!task.location, location: task.location })}
          </div>
          
          {/* Expanded Details Section */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4 mb-5"
              >
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 text-indigo-500 mr-2" />
                      Service Details
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      This is a {task.serviceName} service scheduled for:
                    </p>
                    <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2 shadow-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-700 font-medium">
                          {formatDateOnly(task.scheduledTime || task.date)}
                        </span>
                      </div>
                      {getTimeSlot() && (
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 text-indigo-600 mr-2" />
                          <span className="text-sm text-indigo-700 font-medium">
                            {getTimeSlot()}
                          </span>
                        </div>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        <span className="font-semibold">Description:</span> {task.description}
                      </p>
                    )}
                    {(task.amount > 0 || task.serviceDetails?.amount > 0) && (
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        <span className="font-semibold">Amount:</span>{(task.amount || task.serviceDetails?.amount || 0).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <User className="w-4 h-4 text-indigo-500 mr-2" />
                      Customer Info
                    </h4>
                    {task.customerName && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold">Name:</span> {getCustomerName()}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold">Contact:</span> {formatPhoneNumber(task.customerPhone)}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold">Location:</span> {getAddress()}
                    </p>
                  </div>
                  
                  {(task.notes || task.serviceDetails?.notes) && (
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <FileText className="w-4 h-4 text-indigo-500 mr-2" />
                        Notes
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{task.notes || task.serviceDetails?.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Buttons Section */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center shadow-sm"
            >
              <span>{expanded ? 'Less Details' : 'More Details'}</span>
              {expanded ? 
                <ChevronUp className="w-4 h-4 ml-2" /> : 
                <ChevronDown className="w-4 h-4 ml-2" />
              }
            </button>
            
            {!showCompletedTasks && (
              <>
                <button 
                  onClick={() => setShowDetailModal(true)}
                  className="flex-1 py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center shadow-sm"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                
                {isPending && (
                  <button 
                    onClick={handleStartService}
                    className="flex-1 py-3 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center shadow-sm"
                  >
                    <span>Start Service</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                )}
                
                {isInProgress && (
                  <button 
                    onClick={handleNavigateToService}
                    className="flex-1 py-3 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center shadow-sm"
                  >
                    <span>Complete Service</span>
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </button>
                )}
                
                {isCompleted && (
                  <div className="flex-1 py-3 px-4 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Service Completed</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <ServiceDetailModal
            service={task}
            onClose={() => setShowDetailModal(false)}
            formatDateTime={formatDateTime}
            formatPhoneNumber={formatPhoneNumber}
          />
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <OTPVerificationModal
            onClose={() => setShowOtpModal(false)}
            onVerify={handleOtpVerified}
          />
        )}
      </AnimatePresence>

      {/* Accept Service Confirmation Modal */}
      <AnimatePresence>
        {showAcceptModal && (
          <AcceptServiceModal
            service={task}
            onClose={() => setShowAcceptModal(false)}
            formatPhoneNumber={formatPhoneNumber}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskCard;