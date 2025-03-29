import axios from 'axios';

// Function to set up axios interceptors
export const setupAxiosInterceptors = (handleLogout, navigate) => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.auth_token = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle unauthorized errors (401) or forbidden (403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Authentication error detected in axios interceptor');
        // Call logout function
        if (handleLogout && navigate) {
          handleLogout(true, navigate);
        }
      }
      return Promise.reject(error);
    }
  );
};
