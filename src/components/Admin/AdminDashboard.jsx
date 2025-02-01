import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  IndianRupee
} from 'lucide-react';
import ServiceDetails from './ServiceDetails';
import Sidebar from './Sidebar';
import StatusIndicator from '../Common/StatusIndicator';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/');
      return;
    }
    fetchServices();
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/all`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Updated dashboard stats calculation with safety checks
  const dashboardStats = {
    totalServices: services?.length || 0,
    pendingServices: services?.filter(s => s.status === 'pending')?.length || 0,
    completedServices: services?.filter(s => s.status === 'completed')?.length || 0,
    totalAmount: services?.reduce((sum, service) => sum + (Number(service?.amount) || 0), 0) || 0
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const handleNavigation = (path) => {
    if (path) navigate(path);
  };

  // Updated card rendering with safe value formatting
  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-IN');
    }
    if (typeof value === 'string') {
      return value;
    }
    return '0';
  };

  const formatCurrency = (amount) => {
    return `₹${formatValue(amount)}`;
  };

  const handleServiceClick = (serviceId) => {
    setSelectedService(serviceId);
  };

  // Add refresh function to update services after status change
  const refreshServices = () => {
    fetchServices();
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Statistics Cards - Reduced padding and margins */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { 
              title: 'Total Services',
              value: dashboardStats.totalServices,
              icon: TrendingUp,
              color: 'blue',
              growth: '+12.5%',
              format: formatValue
            },
            { 
              title: 'Pending Services',
              value: dashboardStats.pendingServices,
              icon: Clock,
              color: 'yellow',
              growth: '+5.2%',
              format: formatValue
            },
            { 
              title: 'Completed Services',
              value: dashboardStats.completedServices,
              icon: CheckCircle,
              color: 'green',
              growth: '+8.4%',
              format: formatValue
            },
            { 
              title: 'Total Revenue',
              value: dashboardStats.totalAmount,
              icon: IndianRupee,
              color: 'orange',
              growth: '+15.3%',
              format: formatCurrency
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-${stat.color}-500 group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <h3 className="text-xl font-bold text-gray-800">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      stat.format(stat.value)
                    )}
                  </h3>
                </div>
                <div className={`p-2 rounded-full bg-${stat.color}-50 group-hover:bg-${stat.color}-100 transition-colors duration-300`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-green-500 font-medium">{stat.growth}</span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Services Table with Fixed Height and Scroll */}
        <div className="flex-1 flex flex-col min-h-0">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Services</h2>
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
                  {services.map((service, index) => (
                    <tr 
                      key={index} 
                      onClick={() => handleServiceClick(service._id)}
                      className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.serviceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.userPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusIndicator status={service.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(service.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add ServiceDetails Modal */}
      {selectedService && (
        <ServiceDetails 
          serviceId={selectedService}
          onClose={() => setSelectedService(null)}
          onUpdate={refreshServices} // Add this prop to refresh services after updates
        />
      )}
    </div>
  );
};

export default AdminDashboard;
