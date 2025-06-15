import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import useAuthStore from '../store/auth.store';
import { config, debugLog } from '../config/environment';

// Use environment-based configuration
const BASE_URL = config.API_BASE_URL;

debugLog('API Configuration:', {
  baseUrl: BASE_URL,
  timeout: config.API_TIMEOUT,
  environment: config.ENVIRONMENT
});

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const { user, token } = useAuthStore.getState(); // Get user from Zustand store
  if (user) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  debugLog('API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    hasAuth: !!token
  });
  
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    debugLog('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    debugLog('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      useAuth.getState().signOut();
    }
    return Promise.reject(error);
  }
);
