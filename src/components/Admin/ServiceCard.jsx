import React from 'react';
import StatusIndicator from '../Common/StatusIndicator';

const ServiceCard = ({ service, onClick }) => {
  return (
    <tr 
      onClick={() => onClick(service._id)}
      className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{service.serviceType}</div>
            <div className="text-sm text-gray-500">ID: {service._id.slice(-6)}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{service.userPhone}</div>
        <div className="text-sm text-gray-500">{service.userName || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusIndicator status={service.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{(service.amount || 0).toLocaleString('en-IN')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(service.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </td>
    </tr>
  );
};

export default ServiceCard;
