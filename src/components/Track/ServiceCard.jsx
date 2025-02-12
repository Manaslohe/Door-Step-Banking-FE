import React from 'react';
import { Clock, FileText, MapPin, ChevronRight } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import StatusIndicator from '../Common/StatusIndicator';
import { useTranslation } from '../../context/TranslationContext';

const ServiceCard = ({ service, onClick }) => {
  const { t } = useTranslation();
  const serviceId = service._id.$oid || service._id;
  
  return (
    <div 
      onClick={() => onClick(service)}
      className="group transition-all duration-200 hover:bg-blue-50/80 border-b border-gray-100 last:border-b-0"
    >
      <div className="px-6 py-4 grid grid-cols-12 gap-6 items-center relative">
        {/* Hover Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />

        {/* Service ID */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-200">
            <FileText className="text-blue-500 w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-900 tracking-wide">
              #{typeof serviceId === 'string' ? serviceId.slice(-8) : ''}
            </span>
          </div>
        </div>

        {/* Type */}
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-700 capitalize">
            {service.serviceType?.replace(/_/g, ' ').toLowerCase()}
          </p>
        </div>

        {/* Date */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <Clock className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              {formatDate(service.date)}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="col-span-3">
          <div className="flex items-center gap-2">
            <MapPin className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {service.address || t.serviceTracking.notSpecified}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="col-span-1">
          <div className="flex items-center gap-1">
            <span className="text-emerald-500 font-medium">{t.serviceTracking.currency}</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(service.amount)}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="col-span-2 flex items-center justify-center gap-3">
          <StatusIndicator status={service.status} />
          <ChevronRight 
            className="text-gray-300 w-5 h-5 group-hover:text-blue-500 
              group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" 
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;