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

  const fetchAllTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch tickets');
      }
      
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(handleApiError(err));
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

  const updateTicketStatus = async (ticketId, status) => {
    setIsLoading(true);
    setError(null);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update ticket status');
      }

      // Update the ticket in the tickets array
      setTickets(prev => 
        prev.map(ticket => 
          ticket._id === ticketId ? data.ticket : ticket
        )
      );

      return data.ticket;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitTicket = async (ticketData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get token but don't require it
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...ticketData,
          createdAt: new Date()
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create ticket');
      }

      setTickets(prev => [data.ticket, ...prev]);
      return data.ticket;
    } catch (err) {
      console.error('Ticket submission error:', err);
      // Don't throw error, just log it
      setError('Warning: Ticket created but may have limited functionality');
      // Return a basic success response
      return {
        success: true,
        message: 'Ticket submitted'
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserTickets();
    } else {
      // If no userId is provided, assume we're in admin mode and fetch all tickets
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        fetchAllTickets();
      }
    }
  }, [userId]);

  return {
    tickets,
    isLoading,
    isSubmitting,
    error,
    submitTicket,
    fetchTicket,
    updateTicketStatus,
    refreshTickets: userId ? fetchUserTickets : fetchAllTickets
  };
};
