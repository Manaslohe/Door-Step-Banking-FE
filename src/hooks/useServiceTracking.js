import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../utils/auth';

const useServiceTracking = (serviceId = null) => {
  const [services, setServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const apiUrl = import.meta.env.VITE_APP_API_URL;
        const userPhone = userData.phone.replace(/[^0-9]/g, ''); // Clean phone number
        console.log('Fetching services for phone:', userPhone);
        
        if (serviceId) {
          const { data } = await axios.get(`${apiUrl}/services/${serviceId}`, config);
          console.log('Service details response:', data); // Debug log
          if (mounted && data?.service) {
            setServiceDetails(data.service);
          }
        } else {
          // Use the userPhone field for querying services
          const response = await axios.get(`${apiUrl}/services`, {
            ...config,
            params: {
              userPhone // This will be used as a query parameter
            }
          });
          
          console.log('Services response:', response.data); // Debug log

          if (mounted) {
            if (response.data?.services || response.data?.data) {
              const servicesList = Array.isArray(response.data.services) 
                ? response.data.services 
                : Array.isArray(response.data.data)
                ? response.data.data
                : [];
              setServices(servicesList);
              console.log('Set services:', servicesList.length); // Debug log
            } else {
              console.warn('No services found in response'); // Debug log
              setServices([]);
            }
          }
        }
      } catch (err) {
        console.error('Service tracking error:', err.response || err);
        if (mounted) {
          setError(err.response?.data?.message || err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add delay to ensure auth is initialized
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
