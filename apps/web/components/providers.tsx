'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from './user-provider';

export default function Providers({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode;
  initialUser: any;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider initialSession={initialUser}>
        {children}
      </UserProvider>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
