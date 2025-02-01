import { useState, useEffect } from 'react';
import { createTicket, getUserTickets, getTicketById } from '../services/api';

export const useTickets = (userId) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserTickets(userId);
      setTickets(response.tickets);
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
      throw err;
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
      setError(err.message);
      throw err;
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
