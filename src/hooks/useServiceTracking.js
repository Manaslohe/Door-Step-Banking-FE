import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../utils/auth';

const useServiceTracking = (serviceId = null) => {
  const [services, setServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add base URL resolution
  const getBaseUrl = () => {
    const isDevelopment = import.meta.env.MODE === 'development';
    return isDevelopment 
      ? 'http://localhost:5000/api'
      : 'https://saralbe.vercel.app/api';
  };

  useEffect(() => {
    let mounted = true;
    
    const checkAuthAndFetchData = async () => {
      if (!auth.isSessionValid()) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        const userData = auth.getUserData();
        const token = auth.getToken();

        if (!userData?.phone) {
          throw new Error('User phone number not found');
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const baseUrl = getBaseUrl();
        const userPhone = userData.phone.replace(/[^0-9]/g, '');
        console.log('API URL:', baseUrl);
        console.log('Fetching services for phone:', userPhone);
        
        if (serviceId) {
          const { data } = await axios.get(`${baseUrl}/services/${serviceId}`, config);
          if (mounted && data?.service) {
            setServiceDetails(data.service);
          }
        } else {
          const response = await axios.get(`${baseUrl}/services`, {
            ...config,
            params: { userPhone }
          });

          if (mounted && response.data) {
            const servicesList = response.data?.services || response.data?.data || [];
            setServices(Array.isArray(servicesList) ? servicesList : []);
          }
        }
      } catch (err) {
        console.error('Service tracking error:', {
          message: err.message,
          status: err.response?.status,
          url: err.config?.url,
          data: err.response?.data
        });
        if (mounted) {
          setError(err.response?.data?.message || 'Failed to fetch services');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setTimeout(checkAuthAndFetchData, 100);
    
    return () => { mounted = false; };
  }, [serviceId]);

  const refreshServices = () => {
    setLoading(true);
    setError(null);
    const userData = auth.getUserData();
    if (userData?.phone) {
      console.log('Refreshing services for phone:', userData.phone);
    }
  };

  return { services, serviceDetails, loading, error, refreshServices };
};

export default useServiceTracking;
