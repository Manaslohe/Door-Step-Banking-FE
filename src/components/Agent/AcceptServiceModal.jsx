import React from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AcceptServiceModal = ({ service, onClose, formatPhoneNumber }) => {
  const navigate = useNavigate();
  
  const getAddress = () => {
    if (service.address) return service.address;
    if (service.serviceDetails?.address) return service.serviceDetails.address;
    return service.location || 'No address provided';
  };

  const handleAccept = () => {
    // Update service status to in_progress (would typically be an API call)
    // For now, we'll just navigate to the service navigation page
    navigate(`/service-navigation/${service.id}`, { 
      state: { 
        service,
        destination: getAddress()
      } 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Confirm Service</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Address this Service?</h3>
            <p className="text-gray-600">
              You are about to start service for {service.serviceName}. 
              Once accepted, you'll be navigated to the customer's location.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl mb-6">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Service Location</p>
                <p className="text-blue-700">{getAddress()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button 
              onClick={handleAccept}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <span>Accept & Navigate</span>
              <Navigation className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptServiceModal;
