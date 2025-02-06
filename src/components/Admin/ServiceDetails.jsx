import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, CheckCircle, XCircle, UserPlus, AlertCircle, Clock, IndianRupee, Calendar, Phone, User, Loader2 } from 'lucide-react';

const ServiceDetails = ({ serviceId, onClose, onUpdate }) => {
  const [service, setService] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
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
      fetchAgents();
    }

    return () => {
      // Cleanup on unmount
      setService(null);
      setLoading(true);
      setError('');
    };
  }, [serviceId]);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users?userType=agent`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      
      const data = await response.json();
      console.log('Fetched agents:', data);
      
      if (data.success && Array.isArray(data.users)) {
        setAgents(data.users.filter(user => user.userType === 'agent' && user.isActive));
      } else {
        throw new Error('Invalid agents data format');
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to fetch agents: ' + err.message);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      setLoading(true);
      setError('');
      
      const adminUser = JSON.parse(localStorage.getItem('adminUser'));
      console.log('Sending status update:', { status, adminName: adminUser?.name });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/${serviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          adminName: adminUser?.name || 'Admin'
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
      setUpdateSuccess(`Service status updated to ${status}`);
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

  const handleAgentAssignment = async () => {
    if (!selectedAgent) {
      setError('Please select an agent');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const adminUser = JSON.parse(localStorage.getItem('adminUser'));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/${serviceId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          agentId: selectedAgent,
          adminName: adminUser?.name || 'Admin'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign agent');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to assign agent');
      }

      // Refresh service details
      await fetchServiceDetails();
      setShowAgentModal(false);
      setAssignmentSuccess('Agent assigned successfully');
    } catch (err) {
      console.error('Agent assignment error:', err);
      setError(err.message || 'Failed to assign agent');
    } finally {
      setLoading(false);
    }
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

    // Show approve/reject buttons only for pending services
    if (service.status?.toLowerCase() === 'pending') {
      return (
        <div className="flex justify-end space-x-4 mt-6 border-t pt-6">
          <button
            onClick={() => handleStatusUpdate('rejected')}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <XCircle className="w-5 h-5" />
            <span>Reject Request</span>
          </button>
          <button
            onClick={() => handleStatusUpdate('approved')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Approve Request</span>
          </button>
        </div>
      );
    }

    // Show assign agent button for approved services without an assigned agent
    if (service.status?.toLowerCase() === 'approved' && !service.assignedAgent) {
      return (
        <div className="flex justify-end mt-6 border-t pt-6">
          <button
            onClick={() => setShowAgentModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Assign Agent</span>
          </button>
        </div>
      );
    }

    return null;
  };

  const renderAgentCard = (agent) => (
    <label
      key={agent._id}
      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-colors ${
        selectedAgent === agent._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
      }`}
    >
      <input
        type="radio"
        name="agent"
        value={agent._id}
        checked={selectedAgent === agent._id}
        onChange={(e) => setSelectedAgent(e.target.value)}
        className="hidden"
      />
      <div className="flex-1">
        <p className="font-medium">{agent.name}</p>
        <p className="text-sm text-gray-500">{agent.phone}</p>
        <p className="text-xs text-gray-400">{agent.userId}</p>
      </div>
      <div className="flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          agent.activeAssignments > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {agent.activeAssignments || 0} active tasks
        </span>
      </div>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Service Request Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Notifications */}
          {(error || updateSuccess || assignmentSuccess) && (
            <div className={`mb-6 p-4 rounded-lg ${
              error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            } flex items-start`}>
              <AlertCircle className={`w-5 h-5 ${error ? 'text-red-600' : 'text-green-600'} mt-0.5 mr-2 flex-shrink-0`} />
              <p className={error ? 'text-red-600' : 'text-green-600'}>
                {error || updateSuccess || assignmentSuccess}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : service ? (
            <div className="space-y-6">
              {renderStatusWithActions()}
              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DetailItem icon={Calendar} label="Request Date" value={formatDate(service.createdAt)} />
                  <DetailItem icon={User} label="Customer Name" value={service.userName || 'N/A'} />
                  <DetailItem icon={Phone} label="Contact Number" value={service.userPhone || 'N/A'} />
                  <DetailItem icon={IndianRupee} label="Service Amount" value={formatCurrency(service.amount)} />
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Status:</span>
                    {renderStatusBadge(service.status)}
                  </div>
                </div>

                <div className="space-y-4">
                  <DetailItem icon={User} label="Service Type" value={service.serviceType || 'N/A'} />
                  {service.description && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-700">Description</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Agent Information */}
              {service.assignedAgent && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Assigned Agent</h3>
                  <div className="flex items-center space-x-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{service.assignedAgent.name}</p>
                      <p className="text-sm text-blue-600">{service.assignedAgent.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {renderActionButtons()}
            </div>
          ) : (
            <div className="text-center text-gray-500">No service details found</div>
          )}
        </div>
      </div>

      {/* Agent Assignment Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Assign Agent</h2>
                <p className="text-sm text-gray-500 mt-1">Select an agent to handle this request</p>
              </div>
              <button onClick={() => setShowAgentModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : agents.length > 0 ? (
                <div className="grid gap-3">
                  {agents.map(renderAgentCard)}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No active agents available</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowAgentModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAgentAssignment}
                disabled={!selectedAgent || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Assigning...' : 'Assign Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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