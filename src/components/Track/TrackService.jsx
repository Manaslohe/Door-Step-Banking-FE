import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Search, RefreshCcw } from 'lucide-react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import ServiceCard from './ServiceCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import useServiceTracking from '../../hooks/useServiceTracking';
import ServiceDetailsModal from './ServiceDetailsModal';
import { useTranslation } from '../../context/TranslationContext';

const ColumnHeader = ({ children, align = "center" }) => (
  <div className={`text-xs font-semibold text-gray-600 uppercase tracking-wider text-${align} px-2`}>
    {children}
  </div>
);

const ServiceList = ({ services = [], onServiceSelect }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const userData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userData')) || {};
    } catch (error) {
      return {};
    }
  }, []);

  const filteredServices = services.filter(service => 
    service?._id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    service?.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service?.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (userData.userType === 'ADMIN' && service?.userPhone?.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={userData.userType === 'ADMIN' ? 
              t.serviceTracking.search.admin : 
              t.serviceTracking.search.user}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
          {t.serviceTracking.totalServices}{services.length}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 grid grid-cols-12 gap-6 border-b bg-gray-50">
          <div className="col-span-2"><ColumnHeader>{t.serviceTracking.columns.serviceId}</ColumnHeader></div>
          <div className="col-span-2"><ColumnHeader>{t.serviceTracking.columns.type}</ColumnHeader></div>
          <div className="col-span-2"><ColumnHeader>{t.serviceTracking.columns.date}</ColumnHeader></div>
          <div className="col-span-3"><ColumnHeader>{t.serviceTracking.columns.location}</ColumnHeader></div>
          <div className="col-span-1"><ColumnHeader>{t.serviceTracking.columns.amount}</ColumnHeader></div>
          <div className="col-span-2"><ColumnHeader>{t.serviceTracking.columns.status}</ColumnHeader></div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t.serviceTracking.noServices}</div>
          ) : (
            filteredServices.map((service) => (
              <ServiceCard
                key={service._id?.$oid || service._id}
                service={service}
                onClick={() => setSelectedService(service)}
              />
            ))
          )}
        </div>

        {selectedService && (
          <ServiceDetailsModal
            isOpen={!!selectedService}
            onClose={() => setSelectedService(null)}
            service={selectedService}
            onServiceDeleted={(deletedId) => {
              onServiceSelect(deletedId);
              setSelectedService(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const TrackService = () => {
  const { t } = useTranslation();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { services, loading, error, refreshServices } = useServiceTracking();
  const [selectedService, setSelectedService] = useState(null);

  // Get user data from localStorage
  const userData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userData')) || {};
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  }, []);

  // Filter services based on user type and phone
  const filteredServices = useMemo(() => {
    if (!services || !Array.isArray(services)) return [];
    
    // If user is admin, show all services
    if (userData.userType === 'ADMIN') {
      return services;
    }
    
    // For regular users, only show their services
    return services.filter(service => 
      service.userPhone === userData.phone || 
      service.user?.phone === userData.phone
    );
  }, [services, userData]);

  useEffect(() => {
    if (serviceId) {
      const service = services.find(s => s._id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [serviceId, services]);

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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {userData.userType === 'ADMIN' ? t.tracking.service.title : t.tracking.service.description}
          </h1>
          <button
            onClick={refreshServices}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            {t.serviceTracking.refresh}
          </button>
        </div>

        <ServiceList 
          services={filteredServices}
          onServiceSelect={(id) => {
            // Handle service deletion
            const updatedServices = filteredServices.filter(s => s._id !== id);
            // Update your services state here if needed
          }}
        />

        {selectedService && (
          <ServiceDetailsModal
            isOpen={!!selectedService}
            onClose={() => {
              setSelectedService(null);
              navigate('/track-service', { replace: true });
            }}
            service={selectedService}
            onServiceDeleted={(deletedId) => {
              // Handle service deletion
              refreshServices();
              setSelectedService(null);
              navigate('/track-service', { replace: true });
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrackService;