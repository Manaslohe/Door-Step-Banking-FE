const API_URL = import.meta.env.VITE_API_URL;

export const fetchWithAdminAuth = async (endpoint, options = {}) => {
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    throw new Error('Admin authorization required');
  }

  try {
    // Always add /api prefix to endpoints
    const apiEndpoint = endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`;
    
    console.log('Making admin API request:', {
      url: `${API_URL}${apiEndpoint}`,
      method: options.method || 'GET'
    });

    const response = await fetch(`${API_URL}${apiEndpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

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
    if (error.message !== 'Admin session expired') {
      console.error('API Error:', error);
    }
    throw error;
  }
};
