import axios from 'axios';

const API_URL = import.meta.env.NODE_ENV === 'production' 
  ? import.meta.env.VITE_PRODUCTION_API_URL 
  : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for CORS
api.interceptors.request.use((config) => {
  // Handle preflight
  if (config.method === 'options') {
    config.headers['Access-Control-Request-Method'] = config.method;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Update error handling
const handleApiError = (error) => {
  console.error('API Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    config: {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    }
  });

  if (error.response) {
    throw error.response.data;
  } else if (error.request) {
    throw new Error('Server is not responding. Please check your connection.');
  } else {
    throw new Error('Request failed. Please try again.');
  }
};

const getAuthHeaders = () => {
  const userData = localStorage.getItem('userData');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (userData) {
    const user = JSON.parse(userData);
    headers['user-id'] = user._id;
  }
  
  return headers;
};

// Add better error handling for localStorage
const getStoredUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error reading userData from localStorage:', error);
    return null;
  }
};

// Add user-id to requests if available
api.interceptors.request.use(config => {
  const userData = getStoredUserData();
  
  if (userData) {
    config.headers['user-id'] = userData._id;
    config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  }

  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    environment: import.meta.env.NODE_ENV
  });

  return config;
}, error => {
  console.error('Request Interceptor Error:', error);
  return Promise.reject(error);
});

// Add request interceptor logging
api.interceptors.request.use(config => {
  console.log('Making request:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });
  return config;
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authorization if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Remove the Origin header setting from all interceptors
api.interceptors.request.use(config => {
  const userData = getStoredUserData();
  
  if (userData) {
    config.headers['user-id'] = userData._id;
    config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  }

  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    environment: import.meta.env.MODE
  });

  return config;
}, error => {
  console.error('Request Interceptor Error:', error);
  return Promise.reject(error);
});

// Add response interceptor logging
api.interceptors.response.use(
  response => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    handleApiError(error);
  }
);

// Update request interceptor to handle malformed tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Basic token format validation
        if (token.split('.').length === 3) {
          config.headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.warn('Malformed token detected, proceeding without token');
          localStorage.removeItem('token'); // Clear invalid token
        }
      } catch (error) {
        console.warn('Token validation failed:', error);
        localStorage.removeItem('token');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    
    if (response.data.success) {
      // Ensure data is properly stored
      const { user, token } = response.data;
      
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Verify data was stored
      const storedUser = getStoredUserData();
      if (!storedUser) {
        throw new Error('Failed to store user data');
      }
      
      console.log('Login successful:', {
        userId: user._id,
        environment: import.meta.env.NODE_ENV,
        apiUrl: API_URL
      });
    }
    return response.data;
  } catch (error) {
    console.error('Login Error:', error);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/users/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
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

// Update verifyPAN function to handle errors better
export const verifyPAN = async (pan) => {
  try {
    console.log('Sending PAN verification request:', pan);
    const response = await api.post('/users/verify-pan', { pan });
    console.log('PAN verification response:', response.data);
    
    // Handle both success and no-user-found cases
    return response.data;
  } catch (error) {
    console.error('PAN verification error:', error);
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

export default api;