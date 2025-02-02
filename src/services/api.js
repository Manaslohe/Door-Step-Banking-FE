import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';
const API_URL = isDevelopment 
  ? 'http://localhost:5000/api'
  : 'https://saralbe.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

// Add user-id to requests if available
api.interceptors.request.use(config => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    const user = JSON.parse(userData);
    config.headers['user-id'] = user._id;
    console.log('Request Headers:', config.headers);
  } else {
    console.warn('No user data found in localStorage');
  }
  return config;
}, error => {
  console.error('Request Interceptor Error:', error);
  return Promise.reject(error);
});

// Add environment-specific logging
api.interceptors.request.use(config => {
  console.log(`[${isDevelopment ? 'DEV' : 'PROD'}] Making request:`, {
    url: config.url,
    baseURL: config.baseURL
  });
  return config;
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

export const registerCustomer = async (userData) => {
  try {
    const payload = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: userData.phone, // Using phone as default password
      userType: 'customer',
      aadhaar: userData.aadhaar,
      pan: userData.pan,
      address: userData.address,
      photoUrl: userData.photoUrl || '',
      kycStatus: 'pending'
    };

    console.log('Sending registration payload:', payload);
    const response = await api.post('/users/register', payload);
    if (response.data.success) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    if (response.data.success) {
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      // Verify session immediately
      await getMe(); // This will throw if session is invalid
    }
    return response.data;
  } catch (error) {
    localStorage.removeItem('userData'); // Clear on error
    throw error.response?.data || error.message;
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
    // Clear local storage regardless of response
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    return response.data;
  } catch (error) {
    // Still clear storage even if API call fails
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
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
    const headers = {
      'Content-Type': 'application/json',
      'user-id': user._id
    };

    console.log('Creating ticket with headers:', headers);
    const response = await api.post('/tickets', ticketData, { headers });
    return response.data;
  } catch (error) {
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
