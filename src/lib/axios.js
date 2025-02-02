import axios from 'axios';

const baseURL = import.meta.env.MODE === 'production'
  ? 'https://saralbe.vercel.app/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '30000'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Enhanced retry logic with exponential backoff
const retryDelay = (retryNumber) => {
  const delays = [1000, 2000, 4000, 8000];
  return delays[retryNumber] || delays[delays.length - 1];
};

api.interceptors.request.use(config => {
  // Add user ID and token from localStorage
  const userData = localStorage.getItem('userData');
  const token = localStorage.getItem('token');

  if (userData) {
    const user = JSON.parse(userData);
    config.headers['user-id'] = user._id;
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add timestamp to prevent caching
  config.params = {
    ...config.params,
    _t: Date.now()
  };

  // Log requests in development
  if (import.meta.env.DEV) {
    console.log('API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers
    });
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Maximum retry attempts
    const maxRetries = 3;
    originalRequest.retryCount = originalRequest.retryCount || 0;

    // Retry on network errors, 504, or 408
    const shouldRetry = (
      (error.code === 'ECONNABORTED' || 
       error.response?.status === 504 ||
       error.response?.status === 408) &&
      originalRequest.retryCount < maxRetries
    );

    if (shouldRetry) {
      originalRequest.retryCount += 1;

      // Wait for delay before retrying
      await new Promise(resolve => 
        setTimeout(resolve, retryDelay(originalRequest.retryCount))
      );

      // Log retry attempt
      console.log(`Retrying request (${originalRequest.retryCount}/${maxRetries}):`, 
        originalRequest.url);

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
