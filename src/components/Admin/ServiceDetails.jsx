import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, CheckCircle, XCircle, UserPlus, AlertCircle, Clock, IndianRupee, Calendar, Phone, User, Loader2, MapPin, FileText } from 'lucide-react';
import AssignAgentModal from './AssignAgentModal';
import Toast from './Toast';

const ServiceDetails = ({ serviceId, onClose, onUpdate }) => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${serviceId}`, {  // Add /api prefix
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service details');
      }

      const data = await response.json();
      console.log('Fetched service details:', data); // Debug log
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
    if (serviceId) {
      fetchServiceDetails();
    }

    return () => {
      // Cleanup on unmount
      setService(null);
      setLoading(true);
      setError('');
    };
  }, [serviceId]);

  const handleStatusUpdate = async (status) => {
    try {
      setLoading(true);
      setError('');
      
      const adminToken = localStorage.getItem('adminToken');
      const adminUser = JSON.parse(localStorage.getItem('adminUser'));
      
      if (!adminToken) {
        throw new Error('Admin authorization required');
      }

      console.log('Making status update request:', {
        status,
        adminToken,
        adminUser
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${serviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          adminName: adminUser?.name,
          userType: 'admin',
          adminId: adminUser?.id
        })
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json') 
        ? await response.json()
        : { message: await response.text() };

      console.log('Status update response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Failed to update status: ${response.statusText}`);
      }
      
      setService(data.service);
      setToastMessage(`Service status updated to ${status}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      if (onUpdate) onUpdate(data.service);
      
      if (status === 'APPROVED') {
        setShowAgentModal(true);
      }
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSuccess = async () => {
    await fetchServiceDetails();
    setShowAgentModal(false);
    setAssignmentSuccess('Agent assigned successfully');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVAL_PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStatusBadge = (status) => (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status?.replace('_', ' ')}
    </span>
  );

  const renderStatusWithActions = () => {
    if (!service) return null;

    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Current Status</span>
              <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                {service.status?.replace('_', ' ')}
              </div>
            </div>
          </div>

          {service.status === 'APPROVAL_PENDING' && (
            <div className="flex space-x-3">
              <button
                onClick={() => handleStatusUpdate('REJECTED')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleStatusUpdate('APPROVED')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approve</span>
              </button>
            </div>
          )}
        </div>

        {/* Status History */}
        {service.statusHistory?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-3">Status History</h3>
            <div className="space-y-3">
              {service.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start space-x-3 text-sm">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${getStatusColor(history.status)}`} />
                  <div>
                    <div className="font-medium">{history.status?.replace('_', ' ')}</div>
                    <div className="text-gray-500">
                      {new Date(history.timestamp).toLocaleString()} by {history.updatedBy.name} ({history.updatedBy.role})
                    </div>
                    {history.notes && <div className="text-gray-600 mt-1">{history.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => {
    if (!service) return null;

    // Changed from lowercase to uppercase comparison
    if (service.status === 'APPROVAL_PENDING') {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleStatusUpdate('REJECTED')}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                     transition-colors flex items-center justify-center space-x-2"
          >
            <XCircle className="w-5 h-5" />
            <span>Reject</span>
          </button>
          <button
            onClick={() => handleStatusUpdate('APPROVED')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                     transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Approve</span>
          </button>
        </div>
      );
    }

    if (service.status === 'APPROVED' && !service.assignedAgent) {
      return (
        <button
          onClick={() => setShowAgentModal(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   transition-colors flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Assign Agent</span>
        </button>
      );
    }

    return null;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-xl shadow-xl w-[80vw] max-w-6xl max-h-[85vh] flex flex-col animate-scale-up">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50 rounded-t-xl">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Service Request #{serviceId?.slice(-6)}</h2>
                <p className="text-sm text-gray-500">Created on {service && formatDate(service.createdAt)}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">Loading details...</p>
                </div>
              </div>
            ) : service ? (
              <>
                {/* Left Section - Service Info */}
                <div className="w-2/3 p-6 overflow-y-auto">
                  {/* Service Details Grid */}
                  <div className="grid gap-6">
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Information</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <DetailItem icon={User} label="Service Type" value={service.serviceType || 'N/A'} />
                        <DetailItem icon={IndianRupee} label="Amount" value={formatCurrency(service.amount)} />
                        <DetailItem icon={Calendar} label="Requested Date" value={formatDate(service.createdAt)} />
                        <DetailItem icon={Clock} label="Time Slot" value={service.timeSlot || 'N/A'} />
                      </div>
                    </div>

                    {/* Customer Details & Description sections with similar styling */}
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h3>
                      <div className="space-y-3">
                        <DetailItem icon={User} label="Name" value={service.userName || 'N/A'} />
                        <DetailItem icon={Phone} label="Phone" value={service.userPhone || 'N/A'} />
                        <DetailItem icon={MapPin} label="Address" value={service.address || 'N/A'} />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                      <div className="flex items-start space-x-2">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                        <p className="text-gray-600">{service.description || 'No description provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Status & Actions */}
                <div className="w-1/3 bg-gray-50 p-6 overflow-y-auto border-l">
                  {/* Status section with improved styling */}
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Status</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              service.status === 'APPROVED' ? 'bg-green-500' :
                              service.status === 'REJECTED' ? 'bg-red-500' :
                              service.status === 'ASSIGNED' ? 'bg-blue-500' :
                              service.status === 'COMPLETED' ? 'bg-purple-500' :
                              'bg-yellow-500'
                            }`} />
                            <span className="font-medium text-gray-900">
                              {service.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Last updated: {new Date(service.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {service.status === 'APPROVAL_PENDING' && (
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleStatusUpdate('REJECTED')}
                            className="px-4 py-2.5 bg-white border-2 border-red-500 text-red-600 rounded-lg
                                     hover:bg-red-50 transition-colors flex items-center justify-center space-x-2
                                     font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            <XCircle className="w-5 h-5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate('APPROVED')}
                            className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700
                                     transition-colors flex items-center justify-center space-x-2
                                     font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span>Approve</span>
                          </button>
                        </div>
                      )}

                      {service.status === 'APPROVED' && !service.assignedAgent && (
                        <button
                          onClick={() => setShowAgentModal(true)}
                          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg
                                   hover:bg-blue-700 transition-colors flex items-center justify-center
                                   space-x-2 font-medium focus:outline-none focus:ring-2
                                   focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <UserPlus className="w-5 h-5" />
                          <span>Assign Agent</span>
                        </button>
                      )}
                    </div>

                    {/* Assigned Agent & Status History sections */}
                    {service.assignedAgent && (
                      <div className="bg-white rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800">Assigned Agent</h3>
                        <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">{service.assignedAgent.name}</p>
                            <p className="text-sm text-blue-600">{service.assignedAgent.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white p-5 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Status History</h3>
                      <div className="space-y-4">
                        {service.statusHistory?.map((history, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`w-2 h-2 mt-2 rounded-full ${getStatusColor(history.status)}`} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{history.status?.replace('_', ' ')}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(history.timestamp).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600">by {history.updatedBy.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex justify-center items-center text-gray-500">
                No service details found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Simplified Agent Assignment Modal */}
      {showAgentModal && (
        <AssignAgentModal
          serviceId={serviceId}
          onClose={() => setShowAgentModal(false)}
          onAssignmentSuccess={handleAssignmentSuccess}
        />
      )}
    </>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-2">
    <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default ServiceDetails;