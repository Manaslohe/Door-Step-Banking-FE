import React from 'react';
import { Clock, FileText, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import StatusIndicator from '../Common/StatusIndicator';

const ServiceCard = ({ service, onClick }) => {
  const serviceId = service._id.$oid || service._id;
  
  return (
    <div 
      onClick={() => onClick(service)}
      className="hover:bg-blue-50/40 transition-all cursor-pointer group"
    >
      <div className="px-6 py-3 grid grid-cols-12 gap-4 items-center">
        {/* Service ID */}
        <div className="col-span-1 flex justify-center">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-500 w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 truncate">
              #{typeof serviceId === 'string' ? serviceId.slice(-8) : ''}
            </span>
          </div>
        </div>

        {/* Type */}
        <div className="col-span-2 flex justify-center">
          <p className="text-sm font-medium text-gray-600 capitalize truncate">
            {service.serviceType?.replace(/_/g, ' ').toLowerCase()}
          </p>
        </div>

        {/* Date */}
        <div className="col-span-2 flex justify-center">
          <div className="flex items-center gap-2">
            <Clock className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">
              {formatDate(service.date)}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="col-span-3 flex justify-center">
          <div className="flex items-center gap-2">
            <MapPin className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">
              {service.address || 'Not specified'}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="col-span-1 flex justify-center">
          <div className="flex items-center gap-2">
            <DollarSign className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(service.amount)}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="col-span-3 flex justify-center items-center gap-2">
          <StatusIndicator status={service.status} />
          <ChevronRight 
            className="text-gray-300 w-4 h-4 group-hover:text-gray-400 
              group-hover:translate-x-0.5 transition-all" 
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;