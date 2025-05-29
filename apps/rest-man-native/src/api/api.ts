import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import useAuthStore from '../store/auth.store';

const BASE_URL = 'http://localhost:3000/api'; // TODO: Move to environment variables

export const api = axios.create({
  baseURL: BASE_URL,
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
