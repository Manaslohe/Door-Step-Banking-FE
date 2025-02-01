import { useState, useEffect } from 'react';
import { getMe } from '../services/api';

export const useUser = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedUser = localStorage.getItem('userData');
        if (!savedUser) {
          setLoading(false);
          return;
        }

        const response = await getMe();
        if (response.success && response.user) {
          const userData = {
            ...response.user,
            photoUrl: response.user.photoUrl || '/default-avatar.png'
          };
          setUser(userData);
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const updateUser = (userData) => {
    if (userData) {
      const updatedUser = {
        ...userData,
        photoUrl: userData.photoUrl || '/default-avatar.png'
      };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    } else {
      setUser(null);
      localStorage.removeItem('userData');
    }
  };

  return { user, loading, error, setUser: updateUser };
};
