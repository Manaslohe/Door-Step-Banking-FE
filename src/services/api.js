import axios from 'axios';
import { auth } from '../utils/auth';
import { tokenManager } from '../utils/tokenManager';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = auth.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Don't refresh session on /me endpoint to avoid loops
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
export const verifyPAN = async (pan) => {
  try {
    const { data } = await api.post(
      `${import.meta.env.VITE_APP_API_URL}/users/verify-pan`,
      { pan },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'No user found with this PAN number',
        isNewUser: true
      };
    }
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
    const userData = localStorage.getItem('userData');
    if (!userData) {
      throw new Error('User not authenticated');
    }

    const user = JSON.parse(userData);
    const response = await api.post('/tickets', {
      ...ticketData,
      userId: user._id // Explicitly include userId in request body
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // If unauthorized, try to continue without token
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const fallbackResponse = await api.post('/tickets', {
          ...ticketData,
          userId: userData._id
        }, {
          headers: {
            'user-id': userData._id
          }
        });
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('Fallback request failed:', fallbackError);
        throw new Error('Failed to create ticket. Please try logging in again.');
      }
    }
    console.error('Create Ticket Error:', error);
    handleApiError(error);
  }
};

export const getUserTickets = async (userId) => {
  try {
    const response = await api.get(`/tickets/user/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export default api;