import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  photoUrl?: string;
}

interface AuthState {
  user: User | {
    id: 22,
    name: 'Doron',
    email: 'doron@gmail.com',
  };
  setUser: (user: User | null) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signIn: async () => {
    // TODO: Implement actual sign in logic
    const mockUser: User = {
      id: 22,
      name: 'Doron',
      email: 'doron@gmail.com',
    };
    set({ user: mockUser });
  },
  signOut: async () => {
    // TODO: Implement actual sign out logic
    set({ user: null });
  },
}));
