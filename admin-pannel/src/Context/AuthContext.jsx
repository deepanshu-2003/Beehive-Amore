import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: localStorage.getItem('admin') || 'Admin',
  });
  const [loading, setLoading] = useState(true);

  // Validate token function
  const validateToken = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('No auth token found, admin is not logged in');
      return false;
    }

    try {
      console.log('Validating token...');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/validate-token`,
        { auth_token: token }
      );

      console.log('Token validation response:', response.status);
      if (response.status !== 200) {
        console.log('Token validation failed');
        return false;
      }
      console.log('Token validation successful');
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  // Fetch user details function
  const fetchUserDetails = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('No auth token found for user details');
      setUser({ name: 'Admin' });
      localStorage.setItem('admin', 'Admin');
      return;
    }

    try {
      console.log('Fetching user details...');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/get-admin`,
        {},
        { headers: { auth_token: token } }
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status}`);
      }

      console.log('User details response:', response.data);
      const { first_name, last_name } = response.data;
      const username = `${first_name} ${last_name}`;
      console.log('Setting user state:', username);
      setUser({ name: username });
      localStorage.setItem('admin', username);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUser({ name: 'Admin' });
      localStorage.setItem('admin', 'Admin');
    }
  };

  // Initialize user function
  const initializeUser = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    console.log('Initializing user, token exists:', !!token);

    if (token) {
      const isValidToken = await validateToken();
      console.log('Token validation result:', isValidToken);
      if (isValidToken) {
        setIsLoggedIn(true);
        await fetchUserDetails();
      } else {
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
      setUser({ name: 'Admin' });
    }
    setLoading(false);
  };

  // Login function
  const login = async (authToken) => {
    localStorage.setItem('auth_token', authToken);
    await initializeUser();
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin');
    setIsLoggedIn(false);
    setUser({ name: 'Admin' });
  };

  // Initialize on component mount
  useEffect(() => {
    console.log('AuthProvider mounting, initializing user...');
    initializeUser();

    // Listen for storage changes (for cross-tab login/logout)
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        console.log('Auth token changed in storage, reinitializing');
        initializeUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        login,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
