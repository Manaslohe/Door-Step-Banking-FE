import { useState, useEffect } from 'react';
import { getMe } from '../services/api';
import { toast } from 'react-hot-toast';

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

        const parsedUser = JSON.parse(savedUser);
        if (!parsedUser._id) {
          throw new Error('Invalid user data in localStorage');
        }

        const response = await getMe();
        if (response.success && response.user) {
          updateUser(response.user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        // Clear invalid data
        if (err.message.includes('Invalid user data')) {
          localStorage.removeItem('userData');
          setUser(null);
        }
        toast.error('Failed to load user profile');
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
