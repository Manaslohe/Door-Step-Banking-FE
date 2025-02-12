import axios from 'axios';
import { auth } from '../utils/auth';
import { handleApiError } from '../utils/errorHandling';

// Determine the base URL based on the current environment
const getBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment 
    ? 'http://localhost:5000/api'
    : 'https://saralbe.vercel.app/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (!config.url.includes('/users/me')) {
        auth.refreshSession();
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      console.log('401 error, attempting recovery...');

      // Get cached user data
      const userData = auth.getUserData();
      
      if (userData && window.location.pathname.includes('dashboard')) {
        console.log('Using cached data for dashboard');
        return Promise.resolve({ 
          data: { 
            success: true, 
            user: userData 
          } 
        });
      }
      
      // Don't retry failed retries
      if (error.config._retry) {
        console.log('Recovery failed, using cache if available');
        throw error;
      }

      // Mark as retry attempt
      error.config._retry = true;
      
      // Return cached data for specific endpoints
      if (error.config.url.includes('/users/me')) {
        const cachedUser = auth.getUserData();
        if (cachedUser) {
          console.log('Using cached user data');
          return Promise.resolve({
            data: { success: true, user: cachedUser }
          });
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
api.verifyPAN = async (pan) => {
  try {
    console.log('Making PAN verification request to:', `${api.defaults.baseURL}/users/verify-pan`);
    const { data } = await api.post('/users/verify-pan', { pan });
    console.log('PAN verification response:', data);
    return data;
  } catch (error) {
    console.error('PAN Verification Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Add feedback API method
api.submitFeedback = async (feedbackData) => {
  try {
    const { data } = await api.post('/feedback', feedbackData); // Changed from /feedback/submit
    return data;
  } catch (error) {
    console.error('Feedback submission error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const { data } = await api.post('/users/login', credentials);
    
    if (!data.success || !data.data?.token || !data.data?.user) {
      throw new Error(data.message || 'Invalid login response');
    }

    // Store token and user data
    auth.setAuth(data.data.token, data.data.user);
    
    return data.data;
  } catch (error) {
    console.error('Login error:', error);
    auth.clearAuth(); // Clean up on error
    throw error;
  }
};

// Modified getMe function
export const getMe = async () => {
  // First check if we have valid cached data
  const cachedUser = auth.getUserData();
  if (cachedUser && window.location.pathname.includes('dashboard')) {
    // On dashboard, prefer cached data
    return { success: true, user: cachedUser };
  }

  try {
    const token = auth.getToken();
    if (!token) {
      if (cachedUser) {
        return { success: true, user: cachedUser };
      }
      throw new Error('No authentication token available');
    }

    const { data } = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (data.success && data.user) {
      // Update cached data
      auth.setAuth(token, data.user);
    }

    return data;
  } catch (error) {
    if (error.response?.status === 401 && cachedUser) {
      // Return cached data on auth error if available
      return { success: true, user: cachedUser };
    }
    throw error;
  }
};

export const registerCustomer = async (userData) => {
  try {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'aadhaar', 'pan'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const payload = {
      firstName: userData.firstName?.trim(),
      lastName: userData.lastName?.trim(),
      email: userData.email?.trim().toLowerCase(),
      phone: userData.phone?.trim(),
      password: userData.phone?.trim(), // Using phone as default password
      userType: 'customer',
      aadhaar: userData.aadhaar?.trim(),
      pan: userData.pan?.trim().toUpperCase(),
      address: userData.address?.trim(),
      photoUrl: userData.photoUrl || '',
      kycStatus: 'approved'
    };

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      throw new Error('Invalid email format');
    }

    // Validate phone format (assuming Indian numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(payload.phone)) {
      throw new Error('Invalid phone number format');
    }

    console.log('Sending registration payload:', {
      ...payload,
      password: '[REDACTED]' // Don't log password
    });

    const response = await api.post('/users/register', payload);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Registration failed');
    }

    if (response.data.success && response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    }

    return response.data;
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Format error message for UI
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'Registration failed. Please try again.';

    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    await api.post('/users/logout');
  } finally {
    auth.clearAuth();
    window.location.href = '/';
  }
};

export const createTicket = async (ticketData) => {
  try {
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
      body: JSON.stringify(ticketData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create ticket');
    }

    return data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const getUserTickets = async (userId) => {
  try {
    console.log('Fetching tickets for user:', userId);
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add token to headers if available, but don't require it
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.get(`/tickets/user/${userId}`, { headers });
    console.log('Tickets response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    // Return empty tickets array instead of throwing error
    return { success: true, tickets: [] };
  }
};

export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default api;