import React, { useEffect } from 'react';
import { X, Clock, Calendar, MapPin, Phone, User, FileText, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import StatusIndicator from '../Common/StatusIndicator';

const ServiceDetailsModal = ({ isOpen, onClose, service }) => {
  if (!service || !isOpen) return null;

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative mx-auto max-w-3xl w-full bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Service Details - {service.serviceType?.replace(/_/g, ' ')}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Service Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Service Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">ID: </span>
                    <span className="text-sm font-medium">{service._id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Date & Time: </span>
                    <span className="text-sm font-medium">
                      {formatDate(service.date)} ({service.timeSlot})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Location: </span>
                    <span className="text-sm font-medium">{service.address}</span>
                  </div>
                  {service.amount && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Amount: </span>
                      <span className="text-sm font-medium">{formatCurrency(service.amount)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Contact: </span>
                    <span className="text-sm font-medium">{service.contactNo}</span>
                  </div>
                </div>
              </div>

              {/* Bank Details if available */}
              {(service.bankAccount || service.ifscCode) && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Bank Details</h3>
                  <div className="space-y-3">
                    {service.bankAccount && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Account: </span>
                        <span className="text-sm font-medium">{service.bankAccount}</span>
                      </div>
                    )}
                    {service.ifscCode && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">IFSC: </span>
                        <span className="text-sm font-medium">{service.ifscCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            {service.statusHistory && service.statusHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-4">Service Timeline</h3>
                <div className="space-y-4">
                  {service.statusHistory.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.status}</p>
                        <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                        {event.notes && (
                          <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                        )}
                        {event.updatedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {event.updatedBy.name} ({event.updatedBy.role})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white 
                border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
