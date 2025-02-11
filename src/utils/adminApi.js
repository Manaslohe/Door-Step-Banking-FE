const API_URL = import.meta.env.VITE_API_URL;

export const fetchWithAdminAuth = async (endpoint, options = {}) => {
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    throw new Error('Admin authorization required');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Check if response is okay before throwing error
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
      throw new Error('Admin session expired');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    // Don't remove token for network errors
    if (error.message !== 'Admin session expired') {
      console.error('API Error:', error);
    }
    throw error;
  }
};
