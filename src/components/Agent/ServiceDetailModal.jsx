import React, { useEffect, useState } from 'react';
import { X, Clock, Calendar, Phone, MapPin, IndianRupee, User, ChevronRight, XCircle, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OTPVerificationModal from './OTPVerificationModal';
import AcceptServiceModal from './AcceptServiceModal';

const ServiceDetailModal = ({ service, onClose, formatDateTime, formatPhoneNumber }) => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  useEffect(() => {
    console.log('ServiceDetailModal opening with service data:', service);
    console.log('Service address:', service.address);
    console.log('Service location:', service.location);
    console.log('Service details object:', service.serviceDetails);
  }, [service]);

  if (!service) return null;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const isCompleted = 
    service.status === 'completed' || 
    service.status === 'COMPLETED' || 
    (service.assignmentDetails && service.assignmentDetails.status === 'COMPLETED');
  
  const isPending = 
    service.status === 'pending' || 
    service.status === 'ASSIGNED' || 
    (service.assignmentDetails && service.assignmentDetails.status === 'ASSIGNED');
  
  const isInProgress = 
    service.status === 'in_progress' || 
    service.status === 'IN_PROGRESS' || 
    (service.assignmentDetails && service.assignmentDetails.status === 'IN_PROGRESS');

  const getStatusText = (status) => {
    if (isCompleted) return 'Completed';
    if (isInProgress) return 'In Progress';
    if (isPending) return 'Pending';
    
    if (!status) return 'Unknown';
    
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getStatusIcon = (status) => {
    if (!status) return <AlertCircle className="w-4 h-4" />;
    
    switch (status.toLowerCase()) {
      case 'pending':
      case 'assigned':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Loader className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColorClass = (status) => {
    if (isCompleted) return 'bg-green-100 text-green-700 border border-green-200';
    if (isInProgress) return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (isPending) return 'bg-amber-100 text-amber-700 border border-amber-200';
    
    if (!status) return 'bg-gray-100 text-gray-700';
    
    switch (status.toLowerCase()) {
      case 'pending':
      case 'assigned':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getAddress = () => {
    if (service.address) return service.address;
    if (service.serviceDetails?.address) return service.serviceDetails.address;
    return service.location || 'No address provided';
  };

  const getCustomerName = () => {
    if (service.customerName) return service.customerName;
    if (service.serviceDetails?.userName) return service.serviceDetails.userName;
    return 'Customer';
  };

  const getTimeSlot = () => {
    if (service.timeSlot) return service.timeSlot;
    if (service.serviceDetails?.timeSlot) return service.serviceDetails.timeSlot;
    return 'Not specified';
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

  const formatCompleteDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionDetails = () => {
    if (service.completionDetails) {
      return service.completionDetails;
    }
    
    if (service.serviceDetails?.completionDetails) {
      return service.serviceDetails.completionDetails;
    }
    
    if (service.assignmentDetails?.completedAt) {
      return {
        completedAt: service.assignmentDetails.completedAt,
        completionMethod: 'Agent Confirmation',
        agentDetails: service.assignmentDetails.agentInfo
      };
    }
    
    return null;
  };

  const getCompletionMethodText = (method) => {
    if (!method) return 'Not specified';
    
    const methodMap = {
      'OTP_VERIFICATION': 'OTP Verification',
      'AGENT_CONFIRMATION': 'Agent Confirmation',
      'ADMIN_OVERRIDE': 'Admin Override'
    };
    
    return methodMap[method] || method;
  };

  const completionDetails = getCompletionDetails();

  const navigate = useNavigate();

  const handleNavigateToService = () => {
    onClose();
    navigate('/agent/service/navigate', {
      state: {
        service: service,
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

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{service.serviceName || 'Service Details'}</h2>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-sm ${getStatusColorClass(service.status)}`}>
                {getStatusText(service.status)}
              </span>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {/* Main details */}
            <div className="space-y-5">
              {/* Schedule information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                  Schedule Information
                </h4>
                <div className="flex flex-wrap items-center gap-4 bg-white/70 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-700 font-medium">
                      {formatDateOnly(service.date || service.scheduledTime)}
                    </span>
                  </div>
                  {getTimeSlot() !== 'Not specified' && (
                    <>
                      <div className="text-gray-300">|</div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-indigo-700 font-medium">
                          {getTimeSlot()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Completion details section - only show for completed services */}
              {isCompleted && completionDetails && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl shadow-sm border border-green-100">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Completion Details
                  </h4>
                  <div className="space-y-3 bg-white/70 p-4 rounded-lg">
                    {completionDetails.completedAt && (
                      <div className="flex items-start">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Completed On</p>
                          <p className="font-medium text-gray-900">
                            {formatCompleteDate(completionDetails.completedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {completionDetails.completionMethod && (
                      <div className="flex items-start">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Verification Method</p>
                          <p className="font-medium text-gray-900">
                            {getCompletionMethodText(completionDetails.completionMethod)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {(completionDetails.agentDetails || completionDetails.completedBy) && (
                      <div className="flex items-start">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Completed By</p>
                          <p className="font-medium text-gray-900">
                            {completionDetails.agentDetails?.name || 
                             (typeof completionDetails.completedBy === 'string' ? 'Agent' : 'System')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer information */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-4 h-4 text-gray-700 mr-2" />
                  Customer Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Customer Name</p>
                      <p className="font-medium text-gray-900">{getCustomerName()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Phone Number</p>
                      <p className="font-medium text-gray-900">{formatPhoneNumber(service.customerPhone)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Service Location</p>
                      <p className="font-medium text-gray-900">{getAddress()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service amount - with label */}
              {(service.amount > 0 || (service.serviceDetails?.amount > 0)) && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl shadow-sm border border-amber-100">
                  <div className="flex items-center bg-white/70 p-3 rounded-lg">
                    <div className="bg-amber-100 p-2 rounded-lg mr-3">
                      <IndianRupee className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Service Amount</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {formatCurrency(service.amount || service.serviceDetails?.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional notes or description */}
              {(service.description || service.notes || service.serviceDetails?.notes) && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <ChevronRight className="w-4 h-4 text-gray-700 mr-2" />
                    Additional Notes
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {service.description || service.notes || service.serviceDetails?.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-medium transition-colors border border-gray-300 shadow-sm"
              >
                Close
              </button>
              {isPending && (
                <button 
                  onClick={handleStartService}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Start Service
                </button>
              )}
              {isInProgress && (
                <button 
                  onClick={handleNavigateToService}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Complete Service
                </button>
              )}
              {isCompleted && (
                <div className="flex-1 py-3 px-4 bg-green-100 text-green-700 rounded-lg font-medium flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Service Completed
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <OTPVerificationModal
            onClose={() => setShowOtpModal(false)}
            onVerify={handleOtpVerified}
          />
        )}
      </AnimatePresence>

      {/* Accept Service Modal */}
      <AnimatePresence>
        {showAcceptModal && (
          <AcceptServiceModal
            service={service}
            onClose={() => {
              setShowAcceptModal(false);
              onClose();
            }}
            formatPhoneNumber={formatPhoneNumber}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ServiceDetailModal;