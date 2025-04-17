import { toast } from 'react-toastify';

// Define the global container ID to match main.jsx
const GLOBAL_CONTAINER_ID = 'global-toast-container';

// Default toast configuration
const DEFAULT_TOAST_CONFIG = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  pauseOnFocusLoss: false,
  containerId: GLOBAL_CONTAINER_ID,
  theme: "light",
  limit: 5,
  newestOnTop: true,
  rtl: false,
  toastId: undefined // Will be auto-generated if not provided
};

// Toast types with different styling
export const showToast = {
  success: (message, options = {}) => {
    if (!message) return null;
    try {
      const toastId = options.toastId || `success-${Date.now()}`;
      return toast.success(message, { 
        ...DEFAULT_TOAST_CONFIG, 
        ...options,
        toastId 
      });
    } catch (error) {
      console.error('Toast error:', error);
      return null;
    }
  },
  error: (message, options = {}) => {
    if (!message) return null;
    try {
      const toastId = options.toastId || `error-${Date.now()}`;
      return toast.error(message, { 
        ...DEFAULT_TOAST_CONFIG, 
        ...options,
        toastId
      });
    } catch (error) {
      console.error('Toast error:', error);
      return null;
    }
  },
  info: (message, options = {}) => {
    if (!message) return null;
    try {
      const toastId = options.toastId || `info-${Date.now()}`;
      return toast.info(message, { 
        ...DEFAULT_TOAST_CONFIG, 
        ...options,
        toastId
      });
    } catch (error) {
      console.error('Toast error:', error);
      return null;
    }
  },
  warning: (message, options = {}) => {
    if (!message) return null;
    try {
      const toastId = options.toastId || `warning-${Date.now()}`;
      return toast.warning(message, { 
        ...DEFAULT_TOAST_CONFIG, 
        ...options,
        toastId
      });
    } catch (error) {
      console.error('Toast error:', error);
      return null;
    }
  },
  // For custom styled toasts
  custom: (message, options = {}) => {
    if (!message) return null;
    try {
      const toastId = options.toastId || `custom-${Date.now()}`;
      return toast(message, { 
        ...DEFAULT_TOAST_CONFIG, 
        ...options,
        toastId
      });
    } catch (error) {
      console.error('Toast error:', error);
      return null;
    }
  }
};

// Utility to create and store important toasts with persistent IDs
const persistentToasts = new Map(); // Using Map instead of plain object for better key management

export const persistentToast = {
  // Create or update a persistent toast
  show: (id, message, type = 'info', options = {}) => {
    if (!id || !message) {
      console.error('Invalid parameters for persistent toast:', { id, message, type });
      return null;
    }
    
    try {
      // If toast already exists, update it
      if (persistentToasts.has(id) && toast.isActive(persistentToasts.get(id))) {
        toast.update(persistentToasts.get(id), {
          render: message,
          type: toast.TYPE[type.toUpperCase()],
          ...DEFAULT_TOAST_CONFIG,
          ...options
        });
        return persistentToasts.get(id);
      } else {
        // Create new toast and store its ID
        const safeType = ['success', 'info', 'warning', 'error'].includes(type) ? type : 'info';
        const toastId = showToast[safeType](message, {
          ...options,
          toastId: id
        });
        if (toastId) {
          persistentToasts.set(id, toastId);
        }
        return toastId;
      }
    } catch (error) {
      console.error('Error showing persistent toast:', error);
      return null;
    }
  },
  // Dismiss a specific persistent toast
  dismiss: (id) => {
    try {
      if (persistentToasts.has(id)) {
        const toastId = persistentToasts.get(id);
        if (toast.isActive(toastId)) {
          toast.dismiss(toastId);
        }
        persistentToasts.delete(id);
      }
    } catch (error) {
      console.error('Error dismissing toast:', error);
    }
  },
  // Dismiss all persistent toasts
  dismissAll: () => {
    try {
      persistentToasts.forEach((toastId) => {
        if (toast.isActive(toastId)) {
          toast.dismiss(toastId);
        }
      });
      persistentToasts.clear();
    } catch (error) {
      console.error('Error dismissing all toasts:', error);
    }
  }
};
