import React from 'react';

const StatusIndicator = ({ status }) => {
  const formatStatus = (status) => {
    return status.replace('_', ' ');
  };

  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'approval_pending':
      case 'not approved':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyles(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusIndicator;
