import { useState, useEffect } from 'react';
import axios from 'axios';

const useServiceTracking = (serviceId = null) => {
  const [services, setServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (!authToken || !userData) {
          throw new Error('Authentication required');
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        };

        if (serviceId) {
          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/services/${serviceId}`,
            config
          );
          if (!data?.service) {
            throw new Error('Invalid service data received');
          }
          setServiceDetails(data.service);
        } else {
          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/services/user/${JSON.parse(userData)?._id}`,
            config
          );
          if (!Array.isArray(data?.services)) {
            throw new Error('Invalid services data received');
          }
          setServices(data.services);
        }
      } catch (err) {
        console.error('Service tracking error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [serviceId]);

  return { services, serviceDetails, loading, error };
};

export default useServiceTracking;
