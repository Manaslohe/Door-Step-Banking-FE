import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Users,
  FileText,
  Settings,
  LogOut,
  PlusCircle,
  Activity,
  AlertCircle
} from 'lucide-react';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeLoans: 0,
    pendingApplications: 0,
    completedLoans: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const agentToken = localStorage.getItem('agentToken');
    if (!agentToken) {
      navigate('/');
      return;
    }

    fetchAgentStats();
  }, [navigate]);

  const fetchAgentStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/agent/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('agentToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentUser');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Layout className="w-8 h-8 text-orange-600" />
            <span className="text-xl font-bold">Agent Portal</span>
          </div>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {[
              { icon: Activity, text: 'Dashboard', active: true },
              { icon: Users, text: 'Customers' },
              { icon: FileText, text: 'Loan Applications' },
              { icon: PlusCircle, text: 'New Application' },
              { icon: Settings, text: 'Settings' },
            ].map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  item.active ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Agent Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Customers', value: stats.totalCustomers, color: 'blue' },
            { title: 'Active Loans', value: stats.activeLoans, color: 'green' },
            { title: 'Pending Applications', value: stats.pendingApplications, color: 'yellow' },
            { title: 'Completed Loans', value: stats.completedLoans, color: 'orange' }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${stat.color}-500`}
            >
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading ? '-' : stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
