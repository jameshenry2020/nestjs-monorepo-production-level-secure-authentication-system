'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutAction } from '@/app/actions/auth';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Reset React Query cache
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      toast.error('Failed to log out');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-250 to-slate-400 bg-clip-text text-transparent hidden sm:inline-block">
                AuthSystem
              </span>
            </Link>
            
            <nav className="flex items-center space-x-6 text-sm font-medium text-slate-400">
              <Link href="/dashboard" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link href="/settings" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden md:inline-block">
              Welcome, <span className="font-semibold text-slate-200">{user?.email}</span>
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="h-4.5 w-4.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      {/* Background design */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main dashboard body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 pb-12 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
    </div>
  );
}
