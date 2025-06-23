import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../interfaces/business';

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

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permissions: [],
      role: null,
      isLoading: false,
      error: null,

      signIn: (token, user, permissions = [], role = null) => {
        set({ token, user, permissions, role, error: null });
      },

      signOut: () => {
        set({ token: null, user: null, permissions: [], role: null });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      checkAuth: async () => {
        try {
          const { token } = get();
          if (token) return;
          const storage = localStorage.getItem('auth-storage');
          if (storage) {
            const state = JSON.parse(storage);
            // Add token validation logic here if needed
            set({ 
              token: state.token, 
              user: state.user, 
              permissions: state.permissions || [], 
              role: state.role || null 
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      getStorage: () => localStorage, // specify the storage to use
    }
  )
);

export default useAuthStore;
