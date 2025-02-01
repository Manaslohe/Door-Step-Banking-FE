import { useState } from 'react';
import api from '../services/api';
import { formatDateForBackend } from '../utils/dateUtils';

export const useServiceRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createServiceRequest = async (serviceType, requestData) => {
    try {
      setLoading(true);
      setError(null);

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
        ...requestData,
        ...(requestData.formData || {})
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
        phone: requestData.phone,
        status: 'APPROVAL_PENDING',
        date: formatDateForBackend(requestData.formData?.date || requestData.date),
        timeSlot: requestData.formData?.timeSlot,
        address: requestData.formData?.address
      };

      // Add service-specific fields
      if (serviceType === 'NEW_ACCOUNT') {
        Object.assign(formattedData, {
          bankId: requestData.formData.bankId,
          accountType: requestData.formData.accountType,
          firstName: requestData.formData.firstName,
          lastName: requestData.formData.lastName,
          email: requestData.formData.email || ''
        });
      } else {
        Object.assign(formattedData, {
          bankAccount: requestData.formData.bankAccount,
          amount: requestData.formData.amount,
          ifscCode: requestData.formData.ifscCode
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
