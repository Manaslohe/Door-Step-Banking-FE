import { tokenManager } from './tokenManager';

const TOKEN_KEY = 'token';
const USER_DATA_KEY = 'userData';
const TOKEN_TIMESTAMP_KEY = 'tokenTimestamp';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const auth = {
  setAuth(token, userData) {
    try {
      // Immediate validation
      if (!token) {
        console.error('No token provided');
        return false;
      }

      // Store auth data atomically
      const authData = {
        token,
        user: userData,
        timestamp: Date.now()
      };

      // Store everything at once to prevent race conditions
      localStorage.setItem('authData', JSON.stringify(authData));
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());

      // Set axios default header
      if (window.axios) {
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      console.log('Auth data set successfully:', { hasToken: !!token, hasUser: !!userData });
      return true;
    } catch (error) {
      console.error('Error setting auth:', error);
      return false;
    }
  },

  getToken() {
    try {
      // Try multiple sources for token, with more detailed logging
      const tokenFromStorage = localStorage.getItem(TOKEN_KEY);
      const tokenFromAuthData = JSON.parse(localStorage.getItem('authData'))?.token;
      const dashboardToken = tokenManager.getDashboardToken ? tokenManager.getDashboardToken() : null;
      
      console.log('Token sources:', { 
        tokenFromStorage: !!tokenFromStorage, 
        tokenFromAuthData: !!tokenFromAuthData, 
        dashboardToken: !!dashboardToken 
      });
      
      const token = tokenFromStorage || tokenFromAuthData || dashboardToken;
      
      if (token) {
        // Ensure token is properly stored in all places
        localStorage.setItem(TOKEN_KEY, token);
        return token;
      }
      console.warn('No token found in any storage location');
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  getUserData() {
    try {
      const data = localStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  isSessionValid() {
    try {
      const userData = this.getUserData();
      const token = this.getToken();
      
      // Basic validation
      if (!userData?._id || !token) {
        return false;
      }

      // Check timestamp only if not on dashboard
      if (!window.location.pathname.includes('dashboard')) {
        const timestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
        if (timestamp) {
          const elapsed = Date.now() - parseInt(timestamp, 10);
          return elapsed < SESSION_DURATION;
        }
      }

      // On dashboard, consider valid if we have both token and user data
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  },

  refreshSession() {
    if (this.isSessionValid()) {
      localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
    }
  },

  isAuthenticated() {
    return this.isSessionValid();
  },

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
    // Also clear any other auth-related items
    localStorage.removeItem('authData');
    localStorage.removeItem('dashboardToken');
  }
};

// Add a convenience method to directly access the token
export const getAuthToken = () => {
  return auth.getToken();
};
