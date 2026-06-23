'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore, User } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';

interface UserProviderProps {
  initialSession: User | null;
  children: React.ReactNode;
}

export function UserProvider({ initialSession, children }: UserProviderProps) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set Zustand initial state synchronously on the first render call
  if (!isInitialized) {
    if (initialSession) {
      useAuthStore.setState({ user: initialSession, isAuthenticated: true });
    } else {
      useAuthStore.setState({ user: null, isAuthenticated: false });
    }
    setIsInitialized(true);
  }

  // React Query query function to retrieve authenticated user (live updates)
  const { data: user } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
      } catch (e) {
        return null;
      }
    },
    initialData: initialSession,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Keep Zustand store in sync with React Query profile changes
  useEffect(() => {
    if (user) {
      setAuth(user);
    } else {
      clearAuth();
    }
  }, [user, setAuth, clearAuth]);

  return <>{children}</>;
}
