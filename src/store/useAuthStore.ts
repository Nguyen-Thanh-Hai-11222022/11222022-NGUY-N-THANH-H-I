import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  role: 'admin' | 'customer' | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null, role?: 'admin' | 'customer' | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user, role = null) => set({ user, role, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
