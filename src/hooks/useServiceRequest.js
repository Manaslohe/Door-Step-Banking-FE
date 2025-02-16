import { useState } from 'react';
import api from '../services/api';
import { formatDateForBackend } from '../utils/dateUtils';

export const useServiceRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createServiceRequest = async (serviceType, data) => {
    try {
      setLoading(true);
      setError(null);

      // Special handling for document services
      if (serviceType === 'DOCUMENT_COLLECTION' || serviceType === 'DOCUMENT_DELIVERY') {
        // Ensure all required fields are at root level
        const formattedData = {
          serviceType,
          phone: data.phone,
          date: formatDateForBackend(data.date),
          timeSlot: data.timeSlot,
          address: data.address,
          bankAccount: data.bankAccount,
          documentType: data.documentType,
          status: 'APPROVAL_PENDING'
        };

        const response = await api.post('/services/create', formattedData);
        return response.data;
      }

      // Special handling for LIFE_CERTIFICATE
      if (serviceType === 'LIFE_CERTIFICATE') {
        const formattedData = {
          serviceType,
          phone: data.phone,
          date: formatDateForBackend(data.date),
          timeSlot: data.timeSlot,
          address: data.address,
          pensionAccountNo: data.pensionAccountNo,
          bankAccount: data.pensionAccountNo,  // Use pension account as bank account
          bank: data.bank,
          bankName: data.bank,
          status: 'APPROVAL_PENDING'
        };

        const response = await api.post('/services/create', formattedData);
        return response.data;
      }

      // Handle other service types normally
      // Check if data has the correct structure
      if (!data || (!data.formData && serviceType !== 'DOCUMENT_COLLECTION' && serviceType !== 'DOCUMENT_DELIVERY')) {
        throw new Error('Invalid request data structure');
      }

      // Define base required fields for all services
      const baseFields = ['date', 'timeSlot', 'address'];

      // Define service-specific required fields
      const serviceSpecificFields = {
        CASH_DEPOSIT: ['bankAccount', 'amount'],
        CASH_WITHDRAWAL: ['bankAccount', 'amount'],
        NEW_ACCOUNT: ['bankId', 'accountType', 'firstName', 'lastName'] // No bankAccount required
      };

      // Get required fields for this service type
      const requiredFields = [
        ...baseFields,
        ...(serviceSpecificFields[serviceType] || [])
      ];

      // Validate fields from both root and formData
      const fieldsToValidate = {
        ...data,
        ...(data.formData || {})
      };

      const missingFields = requiredFields.filter(
        field => !fieldsToValidate[field]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Prepare base request data
      const formattedData = {
        serviceType,
        phone: data.phone,
        status: 'APPROVAL_PENDING',
        date: formatDateForBackend(data.formData?.date || data.date),
        timeSlot: data.formData?.timeSlot,
        address: data.formData?.address
      };

      // Add service-specific fields
      if (serviceType === 'NEW_ACCOUNT') {
        Object.assign(formattedData, {
          bankId: data.formData.bankId,
          accountType: data.formData.accountType,
          firstName: data.formData.firstName,
          lastName: data.formData.lastName,
          email: data.formData.email || ''
        });
      } else {
        Object.assign(formattedData, {
          bankAccount: data.formData.bankAccount,
          amount: data.formData.amount,
          ifscCode: data.formData.ifscCode
        });
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.post('/services/create', formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create service request');
      }

      return response.data;
    } catch (error) {
      console.error('Service request error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createServiceRequest,
    loading,
    error
  };
};

export default useServiceRequest;
