import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '30000'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Add user ID from localStorage if available
  const userData = localStorage.getItem('userData');
  if (userData) {
    const user = JSON.parse(userData);
    config.headers['user-id'] = user._id;
  }
  
  // Log requests in development
  if (import.meta.env.DEV) {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
  }
  
  return config;
});

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Retry on network errors or 504
    if ((error.code === 'ECONNABORTED' || error.response?.status === 504) && 
        !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Add delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return api(originalRequest);
    }
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        message: error.message
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
