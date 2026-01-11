import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    // Note: We don't store accessToken in localStorage for security
    // The accessToken is only in memory, refresh token is in httpOnly cookie
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // userData contains { user: {...}, accessToken: "..." }
    // Or if passed separately, token is the second param
    const userInfo = userData.user || userData;
    const jwtToken = token || userData.accessToken;

    setUser(userInfo);
    setAccessToken(jwtToken);

    // Store only user info in localStorage (not the token)
    localStorage.setItem('user', JSON.stringify(userInfo));

    // Set the authorization header for all future API requests
    if (jwtToken) {
      api.defaults.headers.Authorization = `Bearer ${jwtToken}`;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      await api.post('/users/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear state and localStorage
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('favorites'); // Clear anonymous favorites on logout
      localStorage.removeItem('cart'); // Clear anonymous cart on logout

      // Clear authorization header
      delete api.defaults.headers.Authorization;
    }
  };

  const value = {
    user,
    accessToken,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};