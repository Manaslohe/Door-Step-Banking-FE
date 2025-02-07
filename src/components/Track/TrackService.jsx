import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Search, RefreshCcw } from 'lucide-react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import ServiceCard from './ServiceCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import useServiceTracking from '../../hooks/useServiceTracking';
import ServiceDetailsModal from './ServiceDetailsModal';

const ColumnHeader = ({ children, align = "center" }) => (
  <div className={`text-xs font-medium text-gray-500 uppercase tracking-wider text-${align}`}>
    {children}
  </div>
);

const ServiceList = ({ services = [], onServiceSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  const filteredServices = services.filter(service => 
    service?._id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    service?.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service?.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceClick = (service) => {
    setSelectedService(service);
    onServiceSelect(service._id?.$oid || service._id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
          Total Services: {services.length}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-3 grid grid-cols-12 gap-4 border-b">
          <div className="col-span-1"><ColumnHeader>ID</ColumnHeader></div>
          <div className="col-span-2"><ColumnHeader>Type</ColumnHeader></div>
          <div className="col-span-2"><ColumnHeader>Date</ColumnHeader></div>
          <div className="col-span-3"><ColumnHeader>Location</ColumnHeader></div>
          <div className="col-span-1"><ColumnHeader>Amount</ColumnHeader></div>
          <div className="col-span-3"><ColumnHeader>Status</ColumnHeader></div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No services found</div>
          ) : (
            filteredServices.map((service) => (
              <ServiceCard
                key={service._id?.$oid || service._id}
                service={service}
                onClick={() => handleServiceClick(service)}
              />
            ))
          )}
        </div>

        <ServiceDetailsModal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          service={selectedService}
        />
      </div>
    </div>
  );
};

const TrackService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { services, loading, error, refreshServices } = useServiceTracking();

  useEffect(() => {
    // Debug log
    console.log('Current services:', services);
  }, [services]);

  // Add refresh capability
  useEffect(() => {
    const interval = setInterval(refreshServices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Preserve the page state even after reload
  useEffect(() => {
    sessionStorage.setItem('lastVisitedTrackService', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const lastVisited = sessionStorage.getItem('lastVisitedTrackService');
    if (lastVisited && lastVisited !== location.pathname) {
      navigate(lastVisited, { replace: true });
    }
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <ErrorAlert message={`Error: ${error}`} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {serviceId ? (
          <ServiceDetailsModal
            isOpen={true}
            service={services.find(s => s._id === serviceId)}
            onClose={() => navigate('/track-service')}
          />
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Track Your Services</h1>
              {/* Add refresh button */}
              <button
                onClick={refreshServices}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            <ServiceList 
              services={services}
              onServiceSelect={(id) => navigate(`/track-service/${id}`)}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrackService;
