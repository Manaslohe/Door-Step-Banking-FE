import { useState, useEffect } from 'react';
import api from '../services/api';

const useUserServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserServices = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData?.phone) {
          throw new Error('User phone not found');
        }

        // Updated to match the correct backend route
        const response = await api.get(`/services`, {
          params: {
            userPhone: userData.phone
          }
        });
        
        console.log('Services response:', response.data);

        // Handle the response data
        if (response.data && Array.isArray(response.data)) {
          const sortedServices = response.data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setServices(sortedServices);
        } else {
          console.warn('No services array found in response:', response.data);
          setServices([]);
        }
      } catch (err) {
        console.error('Error fetching user services:', err);
        setError(err.message || 'Failed to fetch services');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserServices();
  }, []);

  return { services, loading, error };
};

export default useUserServices;
