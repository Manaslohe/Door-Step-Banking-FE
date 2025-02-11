const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || 
                localStorage.getItem('adminToken') || 
                localStorage.getItem('agentToken');
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  if (response.status === 401) {
    // Handle token expiration
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('agentToken');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'API request failed');
  
  return data;
};
