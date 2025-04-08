import React from 'react';
import { X, Loader, Mail, Phone } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './TrackTicket';
import { useTranslation } from '../../context/TranslationContext';

const TicketDetailsModal = ({ ticket, isLoading, onClose }) => {
  const { t } = useTranslation();
  
  if (!ticket && !isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-auto relative overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-blue-500 p-4 text-white">
          <h2 className="text-xl md:text-2xl font-bold">{t.ticketDetails.title}</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors duration-200 rounded-full p-1 hover:bg-white hover:bg-opacity-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="mt-4 text-gray-500">{t.ticketDetails.loading}</p>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t.ticketDetails.ticketId}</p>
                <p className="font-medium">{ticket._id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t.ticketDetails.type}</p>
                <p className="font-medium capitalize">{ticket.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t.ticketDetails.status}</p>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t.ticketDetails.priority}</p>
                <PriorityBadge priority={ticket.priority} />
              </div>
              
              {/* Message Section */}
              <div className="col-span-2">
                <p className="text-xs text-gray-500">{t.ticketDetails.message}</p>
                <p className="mt-1">{ticket.message}</p>
              </div>

              {/* Contact Information */}
              <div className="col-span-2">
                <p className="text-xs text-gray-500">{t.ticketDetails.contactInformation}</p>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{ticket.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{ticket.contactNo}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t.ticketDetails.close}
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {t.ticketDetails.update}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsModal;