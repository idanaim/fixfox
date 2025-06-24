import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../interfaces/user';

interface AuthState {
  token: string | null;
  user: User | null;
  permissions: string[];
  role: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (token: string, user: User, permissions?: string[], role?: string) => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  token: null,
  user: null,
  permissions: [],
  role: null,
  isLoading: false,
  error: null,

  signIn: (token, user, permissions = [], role) => {
    set({ token, user, permissions, role, error: null });
    // Save to AsyncStorage
    AsyncStorage.setItem('auth-token', token);
    AsyncStorage.setItem('auth-user', JSON.stringify(user));
    AsyncStorage.setItem('auth-permissions', JSON.stringify(permissions));
    if (role) AsyncStorage.setItem('auth-role', role);
  },

  signOut: async () => {
    set({ token: null, user: null, permissions: [], role: null });
    // Clear AsyncStorage
    await AsyncStorage.multiRemove(['auth-token', 'auth-user', 'auth-permissions', 'auth-role']);
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      const userStr = await AsyncStorage.getItem('auth-user');
      const permissionsStr = await AsyncStorage.getItem('auth-permissions');
      const role = await AsyncStorage.getItem('auth-role');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];
        set({ token, user, permissions, role });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ error: 'Failed to check authentication' });
    }
  },
}));

export default useAuthStore;
