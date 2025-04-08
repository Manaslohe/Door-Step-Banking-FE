import React from 'react';
import { DollarSign, FileText, CheckCircle, Activity } from 'lucide-react';

// Format date and time
export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return 'N/A';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  // Format as XXX-XXX-XXXX or return as is if not 10 digits
  return phone.length === 10 
    ? `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
    : phone;
};

// Get status color class
export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get service icon name based on service name - return string identifier
export const getServiceIcon = (serviceName) => {
  if (!serviceName) {
    return 'activity';
  }
  
  if (serviceName.includes('Cash Deposit') || serviceName.includes('Cash Withdrawal')) {
    return 'dollar';
  } else if (serviceName.includes('Account')) {
    return 'file';
  } else if (serviceName.includes('Document')) {
    return 'file';
  } else if (serviceName.includes('Certificate')) {
    return 'check';
  } else {
    return 'activity';
  }
};
