import { useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/api';
import { auth } from '../utils/auth';

export const useUser = () => {
  const [state, setState] = useState({
    user: auth.getUserData(),
    loading: false, // Start with false since we have cached data
    error: null,
    fullName: auth.getUserData()?.firstName ? 
      `${auth.getUserData().firstName} ${auth.getUserData().lastName}` : 
      'Loading...'
  });

  const fetchUserData = useCallback(async () => {
    // If we already have user data, don't show loading state
    const cachedUser = auth.getUserData();
    if (!cachedUser) {
      setState(prev => ({ ...prev, loading: true }));
    }

    try {
      const result = await getMe();
      if (result?.user) {
        setState({
          user: result.user,
          loading: false,
          error: null,
          fullName: `${result.user.firstName} ${result.user.lastName}`
        });
      }
    } catch (error) {
      // Only update state if we don't have cached data
      if (!cachedUser) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
      // Log error but continue with cached data
      console.warn('Using cached data due to fetch error:', error);
    }
  }, []);

  // Only fetch if needed
  useEffect(() => {
    const cachedUser = auth.getUserData();
    if (!cachedUser || !auth.isSessionValid()) {
      fetchUserData();just
    }
  }, [fetchUserData]);

  return state;
};