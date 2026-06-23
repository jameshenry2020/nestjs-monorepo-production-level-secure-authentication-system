import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: {
    id: string;
    name: string;
  } | null;
  permissions: string[];
  userPermissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
