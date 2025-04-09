import React, { useEffect, useState } from 'react';
import { X, Clock, Calendar, MapPin, Phone, User, FileText, 
         IndianRupeeIcon, AlertCircle, Trash2, CheckCircle, 
         Building2, Copy, PhoneCall, Loader2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceDetailsModal = ({ isOpen, onClose, service: initialService, onServiceDeleted }) => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [copied, setCopied] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${initialService._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service details');
      }

      const data = await response.json();
      setService(data.data || data.service); // Handle both data formats
      setError('');
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError(err.message || 'Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialService?._id) {
      fetchServiceDetails();
    }

    return () => {
      // Cleanup on unmount or modal close
      setService(null);
      setLoading(true);
      setError('');
    };
  }, [isOpen, initialService?._id]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
          <div className="flex justify-center items-center h-48">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Loading service details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
          <div className="flex justify-center items-center h-48">
            <div className="flex flex-col items-center space-y-2 text-red-600">
              <AlertCircle className="w-8 h-8" />
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${service._id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service');
      }

      const data = await response.json();

      if (data.success) {
        setShowToast(true);
        setToastMessage('Service deleted successfully');
        setToastType('success');
        setShowDeleteConfirm(false);
        
        if (onServiceDeleted) {
          onServiceDeleted(service._id);
        }
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to delete service');
      }

    } catch (error) {
      console.error('Delete error:', error);
      setDeleteError(error.message);
      setShowToast(true);
      setToastMessage(error.message);
      setToastType('error');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const getStatusColor = (status) => {
    const colors = {
      'APPROVAL_PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'APPROVED': 'bg-green-100 text-green-800 border-green-300',
      'ASSIGNED': 'bg-blue-100 text-blue-800 border-blue-300',
      'COMPLETED': 'bg-purple-100 text-purple-800 border-purple-300',
      'REJECTED': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleCallAgent = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const renderAgentSection = () => {
    if (!service) return null;

    if (service.status === 'COMPLETED' || service.status === 'COMPLETED') {
      // Render completion details section
      return (
        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Service Completion Details
          </h3>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Completion Info */}
              <div className="space-y-3">
                <InfoItem
                  icon={Calendar}
                  label="Completed On"
                  value={formatDate(service.completionDetails?.completedAt || 
                                   service.assignmentDetails?.completedAt)}
                />
                <InfoItem
                  icon={FileText}
                  label="Verification Method"
                  value={formatCompletionMethod(service.completionDetails?.completionMethod)}
                />
              </div>

              {/* Agent Info */}
              <div className="space-y-3 border-l border-gray-100 pl-6">
                <InfoItem
                  icon={User}
                  label="Completed By"
                  value={service.completionDetails?.agentDetails?.name || 
                        service.assignmentDetails?.agentInfo?.name || 'Agent'}
                />
                {(service.completionDetails?.agentDetails?.phone || 
                  service.assignmentDetails?.agentInfo?.phone) && (
                  <div className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <InfoItem
                        icon={Phone}
                        label="Agent Contact"
                        value={service.completionDetails?.agentDetails?.phone || 
                              service.assignmentDetails?.agentInfo?.phone}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (service.status === 'ASSIGNED') {
      return (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            Assigned Agent Information
          </h3>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Agent Personal Info */}
              <div className="space-y-3">
                <InfoItem
                  icon={User}
                  label="Agent Name"
                  value={service.assignmentDetails?.agentInfo?.name}
                />
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <InfoItem
                      icon={Phone}
                      label="Contact"
                      value={service.assignmentDetails?.agentInfo?.phone}
                    />
                  </div>
                  {service.assignmentDetails?.agentInfo?.phone && (
                    <button
                      onClick={() => handleCallAgent(service.assignmentDetails.agentInfo.phone)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 
                               transition-colors flex items-center gap-1"
                      title="Call Agent"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span className="text-sm">Call</span>
                    </button>
                  )}
                </div>
                {service.assignmentDetails?.agentInfo?.userId && (
                  <InfoItem
                    icon={FileText}
                    label="Email"
                    value={service.assignmentDetails.agentInfo.userId}
                  />
                )}
              </div>

              {/* Assignment Details */}
              <div className="space-y-3 border-l border-gray-100 pl-6">
                <InfoItem
                  icon={Calendar}
                  label="Assigned On"
                  value={formatDate(service.assignmentDetails?.assignedAt)}
                />
                {service.assignmentDetails?.assignedBy && (
                  <InfoItem
                    icon={User}
                    label="Assigned By"
                    value={`${service.assignmentDetails.assignedBy.name} (${service.assignmentDetails.assignedBy.role})`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Live Agent Tracking - moved here */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mt-4">
            <h3 className="text-base font-semibold text-blue-900 flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              Live Agent Tracking
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Agent is en route</p>
                  <p className="text-sm text-gray-600">
                    Expected arrival in your time slot
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-2/5 rounded-full"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Your agent will reach your location within the scheduled time slot.
              </p>
            </div>
          </div>
        </div>
      );
    } else if (service.status === 'APPROVED') {
      return (
        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Service approved by admin. Waiting for agent assignment.
            </span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Utility function to format completion method
  const formatCompletionMethod = (method) => {
    if (!method) return 'Not specified';
    
    const methodMap = {
      'OTP_VERIFICATION': 'OTP Verification',
      'AGENT_CONFIRMATION': 'Agent Confirmation',
      'ADMIN_OVERRIDE': 'Admin Approval'
    };
    
    return methodMap[method] || method.replace(/_/g, ' ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-40 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-hidden flex flex-col"
          >
            {/* Header - Added delete button */}
            <div className="px-8 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Service Details
                    </h2>
                    <p className="text-base text-gray-600">
                      ID: {service._id?.slice(-6)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-5 py-2 rounded-full text-base font-medium border ${getStatusColor(service.status)}`}>
                      {service.status?.replace(/_/g, ' ')}
                    </span>
                    {service.status === 'APPROVAL_PENDING' && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 border-2 border-red-200 
                                 rounded-lg transition-colors flex items-center gap-2"
                        title="Delete service request"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="font-medium">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content - Optimized spacing and improved readability */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Service Information
                    </h3>
                    <div className="space-y-4">
                      <InfoItem
                        icon={Building2}
                        label="Service Type"
                        value={service.serviceType?.replace(/_/g, ' ')}
                      />
                      <InfoItem
                        icon={IndianRupeeIcon}
                        label="Amount"
                        value={formatCurrency(service.amount)}
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Service Date"
                        value={formatDate(service.date)}
                      />
                      <InfoItem
                        icon={Clock}
                        label="Time Slot"
                        value={service.timeSlot}
                      />
                    </div>
                  </div>

                  {/* Bank Details - Conditional rendering */}
                  {(service.bankAccount || service.ifscCode) && (
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Bank Details
                      </h3>
                      <div className="space-y-3">
                        <InfoItem
                          icon={FileText}
                          label="Account Number"
                          value={service.bankAccount}
                          copyable
                          onCopy={() => copyToClipboard(service.bankAccount, 'account')}
                          copied={copied === 'account'}
                        />
                        <InfoItem
                          icon={FileText}
                          label="IFSC Code"
                          value={service.ifscCode}
                          copyable
                          onCopy={() => copyToClipboard(service.ifscCode, 'ifsc')}
                          copied={copied === 'ifsc'}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Middle Column - Agent Info */}
                <div className="bg-gray-50 rounded-xl p-5">
                  {service.status === 'COMPLETED' ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Completed Service
                      </h3>
                      <div className="bg-white rounded-lg p-5 shadow-sm space-y-4">
                        <InfoItem
                          icon={Calendar}
                          label="Completed On"
                          value={formatDate(service.completionDetails?.completedAt || 
                                           service.assignmentDetails?.completedAt)}
                          larger
                        />
                        <InfoItem
                          icon={User}
                          label="Completed By"
                          value={service.completionDetails?.agentDetails?.name || 
                                service.assignmentDetails?.agentInfo?.name || 'Agent'}
                          larger
                        />
                        <InfoItem
                          icon={FileText}
                          label="Verification"
                          value={formatCompletionMethod(service.completionDetails?.completionMethod)}
                          larger
                        />
                      </div>
                    </>
                  ) : service.status === 'ASSIGNED' ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-blue-600" />
                        Assigned Agent
                      </h3>
                      <div className="bg-white rounded-lg p-5 shadow-sm space-y-4">
                        <InfoItem
                          icon={User}
                          label="Agent Name"
                          value={service.assignmentDetails?.agentInfo?.name}
                          larger
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex-grow">
                            <InfoItem
                              icon={Phone}
                              label="Contact"
                              value={service.assignmentDetails?.agentInfo?.phone}
                              larger
                            />
                          </div>
                          {service.assignmentDetails?.agentInfo?.phone && (
                            <button
                              onClick={() => handleCallAgent(service.assignmentDetails.agentInfo.phone)}
                              className="px-4 py-2 bg-green-100 text-green-600 rounded-lg 
                                       hover:bg-green-200 transition-colors flex items-center gap-2"
                            >
                              <PhoneCall className="w-5 h-5" />
                              <span className="text-base">Call</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Live Agent Tracking - moved here */}
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mt-4">
                        <h3 className="text-base font-semibold text-blue-900 flex items-center gap-2 mb-3">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          Live Agent Tracking
                        </h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Agent is en route</p>
                              <p className="text-sm text-gray-600">
                                Expected arrival in your time slot
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-2/5 rounded-full"></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Your agent will reach your location within the scheduled time slot.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                      <span className="text-base text-yellow-800">
                        {service.status === 'APPROVED' 
                          ? 'Service approved. Waiting for agent assignment.'
                          : 'Service is pending approval.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Column - Timeline */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Service Timeline
                  </h3>
                  <div className="space-y-4">
                    {service.statusHistory?.map((event, index) => (
                      <TimelineEvent key={index} event={event} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <DeleteConfirmationModal
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
              error={deleteError}
              isDeleting={isDeleting}
            />
          )}

          {/* Toast Notification */}
          {showToast && (
            <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
              toastType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {toastType === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p>{toastMessage}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Updated InfoItem component with larger text option
const InfoItem = ({ icon: Icon, label, value, copyable, onCopy, copied, larger = false }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className={`${larger ? 'w-5 h-5' : 'w-4 h-4'} text-gray-400`} />
      <span className={`${larger ? 'text-base' : 'text-sm'} text-gray-600 font-medium`}>
        {label}:
      </span>
      <span className={`${larger ? 'text-base' : 'text-sm'} font-semibold text-gray-900`}>
        {value}
      </span>
    </div>
    {copyable && (
      <button
        onClick={onCopy}
        className="p-2 hover:bg-gray-200 rounded transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Copy className="w-5 h-5 text-gray-400" />
        )}
      </button>
    )}
  </div>
);

// Updated TimelineEvent component with larger text
const TimelineEvent = ({ event }) => (
  <div className="flex items-start gap-3">
    <div className="w-3 h-3 mt-2 rounded-full bg-blue-600" />
    <div>
      <p className="text-base font-semibold text-gray-900">
        {event.status?.replace(/_/g, ' ')}
      </p>
      <p className="text-sm text-gray-600 mt-1">
        {formatDate(event.timestamp)}
      </p>
      {event.updatedBy && (
        <p className="text-sm text-gray-500 mt-0.5">
          by {event.updatedBy.name} ({event.updatedBy.role})
        </p>
      )}
    </div>
  </div>
);

const DeleteConfirmationModal = ({ onConfirm, onCancel, error, isDeleting }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex items-center gap-3 text-red-600 mb-4">
        <AlertCircle className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Delete Service Request</h3>
      </div>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete this service request? This action cannot be undone.
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                   transition-colors flex items-center gap-2"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default ServiceDetailsModal;