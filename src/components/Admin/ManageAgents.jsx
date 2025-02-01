import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Sidebar from './Sidebar';

const ManageAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      console.log('Fetching agents...'); // Debug log
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/agents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch agents');
      }
      
      const data = await response.json();
      console.log('Received agents data:', data); // Debug log
      
      if (data.success && Array.isArray(data.agents)) {
        setAgents(data.agents);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.error('Error in fetchAgents:', err); // Debug log
      setError('Failed to load agents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const agentData = {
        name: newAgent.name,
        userId: newAgent.email, // Using email as userId
        password: newAgent.password,
        phoneNumber: newAgent.phone,
        userType: 'agent'
      };

      console.log('Sending agent data:', agentData); // Debug log

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(agentData)
      });

      const data = await response.json();
      console.log('Response:', data); // Debug log
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add agent');
      }

      await fetchAgents();
      setShowAddModal(false);
      setNewAgent({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      console.error('Error adding agent:', err);
      setError(err.message || 'Failed to add agent');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to remove this agent?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to remove agent');
      await fetchAgents();
    } catch (err) {
      setError('Failed to remove agent');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const renderAgentTable = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {agents.map((agent) => (
            <tr key={agent._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {agent.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {agent.email} {/* This is actually userId */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {agent.phone} {/* This is actually phoneNumber */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {agent.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleRemoveAgent(agent._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Agents</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Agent</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No agents found
          </div>
        ) : (
          renderAgentTable()
        )}
      </div>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Agent</h2>
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email (User ID)</label>
                <input
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent({...newAgent, phone: e.target.value})}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAgents;
