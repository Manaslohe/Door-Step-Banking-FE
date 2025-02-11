import React, { useState, useEffect } from 'react';
import { X, User, Loader2, Search, UserCheck, AlertCircle, Users } from 'lucide-react';
import Toast from './Toast';

const AssignAgentModal = ({ serviceId, onClose, onAssignmentSuccess }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('No admin token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users?userType=agent`, {  // Add /api prefix
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch agents');
      }
      
      const data = await response.json();
      console.log('Fetched agents:', data);  // Add debug log
      
      if (data.success && Array.isArray(data.users)) {
        setAgents(data.users.filter(user => user.userType === 'agent' && user.isActive));
      } else {
        throw new Error('Invalid agents data format');
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to fetch agents: ' + err.message);
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

      const adminToken = localStorage.getItem('adminToken');
      const adminUser = JSON.parse(localStorage.getItem('adminUser'));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${serviceId}/assign`, {  // Add /api prefix
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          agentId: selectedAgent,
          adminName: adminUser?.name || 'Admin'
        })
      });

      // Add debug logging
      console.log('Assignment response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign agent');
      }

      const data = await response.json();
      console.log('Assignment successful:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to assign agent');
      }

      setToastMessage('Agent assigned successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onAssignmentSuccess();
      onClose();
    } catch (err) {
      console.error('Agent assignment error:', err);
      setError(err.message || 'Failed to assign agent');
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.phone.includes(searchQuery)
  );

  const renderAgentCard = (agent) => (
    <label
      key={agent._id}
      className={`group flex items-center justify-between p-4 rounded-lg cursor-pointer border-2 transition-all
        ${selectedAgent === agent._id 
          ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
          : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
    >
      <input
        type="radio"
        name="agent"
        value={agent._id}
        checked={selectedAgent === agent._id}
        onChange={(e) => setSelectedAgent(e.target.value)}
        className="hidden"
      />
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center
          ${selectedAgent === agent._id ? 'bg-blue-100' : 'bg-gray-100'}
          group-hover:bg-blue-50 transition-colors`}>
          <User className={`w-6 h-6 ${selectedAgent === agent._id ? 'text-blue-600' : 'text-gray-500'}`} />
        </div>
        <div>
          <p className={`font-medium ${selectedAgent === agent._id ? 'text-blue-900' : 'text-gray-900'}`}>
            {agent.name}
          </p>
          <p className="text-sm text-gray-500">{agent.phone}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium 
          ${agent.activeAssignments > 5 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'}`}>
          {agent.activeAssignments || 0} active
        </span>
        {selectedAgent === agent._id && (
          <UserCheck className="w-5 h-5 text-blue-500 animate-fadeIn" />
        )}
      </div>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-[71] animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/80 backdrop-blur rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Assign Agent</h2>
              <p className="text-sm text-gray-500">Select an agent to handle this service request</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agents by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Loading agents...</p>
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid gap-3">
              {filteredAgents.map(renderAgentCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No agents found {searchQuery && 'matching your search'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50/80 backdrop-blur rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAgentAssignment}
              disabled={!selectedAgent || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Assign Agent</span>
                </>
              )}
            </button>
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
    </div>
  );
};

export default AssignAgentModal;
