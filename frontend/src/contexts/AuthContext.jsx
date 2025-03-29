import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { showToast, persistentToast } from '../utils/toastUtils';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [user, setUser] = useState({
    name: localStorage.getItem('user') || 'Guest User',
    profileImg: localStorage.getItem('profile_img') || null,
  });
  const [loading, setLoading] = useState(true);
  const [lastValidated, setLastValidated] = useState(0); // Track last validation time

  // Validate token function
  const validateToken = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('No auth token found, user is not logged in');
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
      setLastValidated(Date.now()); // Update last validation timestamp
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
      setUser({ name: 'Guest User', profileImg: null });
      localStorage.setItem('user', 'Guest User');
      localStorage.removeItem('profile_img');
      return;
    }

    try {
      console.log('Fetching user details...');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/get-user`,
        {},
        { headers: { auth_token: token } }
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status}`);
      }

      console.log('User details response:', response.data);
      const { first_name, last_name, profile_img, email_verified } = response.data;
      const username = `${first_name} ${last_name}`;
      console.log('Setting user state:', username, profile_img);
      setUser({ name: username, profileImg: profile_img });
      setIsEmailVerified(email_verified);
      localStorage.setItem('user', username);
      localStorage.setItem('profile_img', profile_img || '');
    } catch (error) {
      console.error('Error fetching user details:', error);
      // If we get a 401 Unauthorized, the token is invalid or expired
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleLogout(false, null);
      } else {
        setUser({ name: 'Guest User', profileImg: null });
        localStorage.setItem('user', 'Guest User');
        localStorage.removeItem('profile_img');
      }
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
        handleLogout(false, null);
      }
    } else {
      setIsLoggedIn(false);
      setUser({ name: 'Guest User', profileImg: null });
    }
    setLoading(false);
  };

  // Check token validity - can be called on each route change or key component mount
  const checkTokenValidity = async (navigateFunction = null) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    // Only validate if it's been more than 1 minute since last validation
    // This prevents excessive API calls on frequent component renders
    const now = Date.now();
    if (isLoggedIn && now - lastValidated < 60000) {
      console.log('Using cached token validation');
      return true;
    }
    
    const isValid = await validateToken();
    if (!isValid && isLoggedIn) {
      console.log('Token is invalid, logging out');
      handleLogout(false, navigateFunction);
      persistentToast.show(
        'session-expired',
        'Your session has expired. Please login again.',
        'error',
        { autoClose: 5000 }
      );
      return false;
    }
    return isValid;
  };

  // Login function
  const login = async (authToken) => {
    localStorage.setItem('auth_token', authToken);
    await initializeUser();
  };

  // Logout function
  const handleLogout = (redirect = true, navigate = null) => {
    console.log('Logging out, redirect:', redirect);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile_img');
    setIsLoggedIn(false);
    setUser({ name: 'Guest User', profileImg: null });
    setIsEmailVerified(false);

    if (redirect && navigate) {
      navigate('/');
      persistentToast.show(
        'logout-success',
        'You have been logged out successfully',
        'info',
        { autoClose: 5000 }
      );
    }
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
        isEmailVerified,
        user,
        loading,
        login,
        handleLogout,
        initializeUser,
        checkTokenValidity, // Expose the token validity check function
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

// Authentication wrapper component to check token validity on route changes
export const AuthChecker = ({ children }) => {
  const { checkTokenValidity } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check token validity on route change
    const validateAuth = async () => {
      await checkTokenValidity(navigate);
    };
    validateAuth();
  }, [location.pathname, navigate, checkTokenValidity]);

  return <>{children}</>;
};
