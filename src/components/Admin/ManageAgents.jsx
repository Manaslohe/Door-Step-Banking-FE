import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { fetchWithAdminAuth } from '../../utils/adminApi';
import AdminLayout from './AdminLayout';

const ManageAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    userId: '',
    password: '',
    name: '',
    phoneNumber: '',
    userType: 'agent'
  });

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          navigate('/admin/login');
          return;
        }

        // Verify token validity
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        // Token is valid, fetch agents
        fetchAgents();
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  const fetchAgents = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users?userType=agent`, {  // Add /api prefix
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      if (data.users) {
        setAgents(data.users.filter(user => user.userType === 'agent'));
        setError('');
      }
    } catch (err) {
      console.error('Error in fetchAgents:', err);
      setError(err.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const agentData = {
        ...newAgent,
        email: newAgent.userId,
        phoneNumber: newAgent.phoneNumber, // This will be stored as 'phone' in backend
        userType: 'agent',
        isActive: true
      };

      await fetchWithAdminAuth('/users/register', {
        method: 'POST',
        body: JSON.stringify(agentData)
      });

      await fetchAgents();
      setShowAddModal(false);
      setNewAgent({ userId: '', password: '', name: '', phoneNumber: '', userType: 'agent' });
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
      console.log('Removing agent:', agentId);
      await fetchWithAdminAuth(`/users/${agentId}`, {
        method: 'DELETE'
      });
      console.log('Agent removed successfully');
      await fetchAgents(); // Refresh the list
    } catch (err) {
      console.error('Error removing agent:', err);
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email/User ID</th>
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
                {agent.userId || agent.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {agent.phone}
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
    <AdminLayout>
      <div className="flex flex-col h-full">
        {/* Main Content */}
        <div className="flex-1">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Add New Agent</h2>
              <form onSubmit={handleAddAgent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    type="text"
                    value={newAgent.userId}
                    onChange={(e) => setNewAgent({...newAgent, userId: e.target.value})}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={newAgent.phoneNumber}
                    onChange={(e) => setNewAgent({...newAgent, phoneNumber: e.target.value})}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                    required
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
    </AdminLayout>
  );
};

export default ManageAgents;
