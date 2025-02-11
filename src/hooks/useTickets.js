import { useState, useEffect } from 'react';
import { createTicket, getUserTickets, getTicketById } from '../services/api';
import { handleApiError } from '../utils/errorHandling';
import { useNavigate } from 'react-router-dom';

export const useTickets = (userId) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserTickets(userId);
      setTickets(response.tickets || []);
    } catch (err) {
      // Don't set error for auth failures
      if (!err.message.includes('auth')) {
        setError(handleApiError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicket = async (ticketId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTicketById(ticketId);
      return response.ticket;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const submitTicket = async (ticketData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await createTicket(ticketData);
      setTickets(prev => [response.ticket, ...prev]);
      return response.ticket;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserTickets();
    }
  }, [userId]);

  return {
    tickets,
    isLoading,
    isSubmitting,
    error,
    submitTicket,
    fetchTicket,
    refreshTickets: fetchUserTickets
  };
};
