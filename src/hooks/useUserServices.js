import { useState, useEffect } from 'react';
import api from '../services/api';

const useUserServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await api.get('/user/services', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.data?.data) {
          throw new Error('Invalid response format');
        }

        setServices(response.data.data);
      } catch (err) {
        console.error('Error fetching services:', err);
        let errorMessage = 'Error fetching services';
        
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'Session expired. Please login again';
              localStorage.removeItem('token');
              break;
            case 403:
              errorMessage = 'You do not have permission to view services';
              break;
            default:
              errorMessage = err.response.data?.message || errorMessage;
          }
        } else if (err.request) {
          errorMessage = 'Network error. Please check your connection';
        }
        
        setError(errorMessage);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};

export default useUserServices;
