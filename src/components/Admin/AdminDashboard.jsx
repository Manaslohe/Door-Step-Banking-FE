import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Calendar, AlertCircle, IndianRupee, XCircle
} from 'lucide-react';
import ServiceDetails from './ServiceDetails';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import ServiceCard from './ServiceCard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    amountRange: 'all'
  });
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

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

        // Token is valid, fetch services
        fetchServices();
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [filters, services]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services/all`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...services];
    let filterCount = 0;

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(service => service.status === filters.status);
      filterCount++;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          result = result.filter(service => 
            new Date(service.createdAt).toDateString() === now.toDateString()
          );
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          result = result.filter(service => 
            new Date(service.createdAt) >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          result = result.filter(service => 
            new Date(service.createdAt) >= monthAgo
          );
          break;
      }
      filterCount++;
    }

    // Amount range filter
    if (filters.amountRange !== 'all') {
      const [min, max] = filters.amountRange.split('-').map(Number);
      result = result.filter(service => {
        const amount = Number(service.amount);
        if (max) {
          return amount >= min && amount <= max;
        }
        return amount >= min;
      });
      filterCount++;
    }

    setActiveFilterCount(filterCount);
    setFilteredServices(result);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const handleNavigation = (path) => {
    if (path) navigate(path);
  };

  const handleServiceClick = (serviceId) => {
    setSelectedService(serviceId);
  };

  const refreshServices = () => {
    fetchServices();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const FilterBadge = ({ count }) => count > 0 ? (
    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
      {count} active
    </span>
  ) : null;

  const headerSection = (
    <header className="bg-blue-600">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        </div>
      </div>
    </header>
  );

  const filterSection = (
    <div className="bg-white rounded-xl shadow-sm mb-6">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
          <FilterBadge count={activeFilterCount} />
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters({
              status: 'all',
              dateRange: 'all',
              amountRange: 'all'
            })}
            className="text-sm text-gray-500 hover:text-red-500 flex items-center space-x-1"
          >
            <XCircle className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Status</span>
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="APPROVAL_PENDING">Approval Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Time Period</span>
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* Amount Range Filter */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span>Price Range</span>
          </label>
          <select
            value={filters.amountRange}
            onChange={(e) => handleFilterChange('amountRange', e.target.value)}
            className="w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Amounts</option>
            <option value="0-500">Under ₹500</option>
            <option value="500-2000">₹500 - ₹2,000</option>
            <option value="2000-5000">₹2,000 - ₹5,000</option>
            <option value="5000-10000">₹5,000 - ₹10,000</option>
            <option value="10000-999999">Above ₹10,000</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {headerSection}

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {filterSection}

        {/* Services Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Services</h2>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Info</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      onClick={handleServiceClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedService && (
          <ServiceDetails 
            serviceId={selectedService}
            onClose={() => setSelectedService(null)}
            onUpdate={refreshServices}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
