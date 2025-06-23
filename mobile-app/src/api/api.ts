import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import useAuthStore from '../store/auth.store';
import { API_BASE_URL } from '../config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const { user, token } =useAuthStore.getState(); // Get user from Zustand store
  if (user) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      useAuth.getState().signOut();
    }
    return Promise.reject(error);
  }
);
