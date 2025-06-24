import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../interfaces/user';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
}

interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuthStatus: () => Promise<void>;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  user: null,
};

export const useAuth = create<AuthState & AuthActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    setUser: (user: User | null) => set({ user }),
    login: (token: string, user: User) => {
      set({
        isLoggedIn: true,
        token,
        user,
      });
      AsyncStorage.setItem('authToken', token);
      AsyncStorage.setItem('user', JSON.stringify(user));
    },
    logout: () => {
      set({ isLoggedIn: false, token: null, user: null });
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('user');
    },
    checkAuthStatus: async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          set({
            isLoggedIn: true,
            token,
            user,
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    },
  }))
);
