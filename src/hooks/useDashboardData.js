import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { getUserTickets } from '../services/api';

export const useDashboardData = () => {
  const { user } = useUser();
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?._id) {
          console.log('Fetching tickets for user:', user._id);
          const response = await getUserTickets(user._id);
          console.log('Tickets API response:', response);
          
          if (response?.success && response?.tickets) {
            setRecentTickets(response.tickets.slice(0, 5));
            console.log('Set recent tickets:', response.tickets.slice(0, 5));
          } else {
            console.log('No tickets found in response');
            setRecentTickets([]);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setRecentTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);

  return {
    recentTickets,
    loading,
    error
  };
};
