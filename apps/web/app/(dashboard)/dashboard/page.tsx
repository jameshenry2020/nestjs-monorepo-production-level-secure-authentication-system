'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Settings, 
  PlusCircle, 
  Activity, 
  Key,
  Lock,
  User,
  ExternalLink,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch user organizations
  const { data: organizations = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data } = await api.get('/organizations');
      return data;
    },
  });

  // Calculate some visual stats
  const totalOrgs = organizations.length;
  const directPermsCount = user?.role?.permissions?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || user?.email.split('@')[0]}!
            </h1>
            <p className="text-indigo-100/90 text-sm max-w-xl">
              Access your organizations, manage projects, and oversee system role permissions in one unified secure dashboard.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/organizations/create">
              <Button className="bg-white hover:bg-slate-100 text-indigo-600 font-semibold rounded-xl border-none shadow-lg shadow-black/10">
                <PlusCircle className="mr-2 h-4.5 w-4.5" />
                New Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 transition-all hover:scale-[1.01]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organizations</span>
              <div className="text-3xl font-extrabold">{totalOrgs}</div>
            </div>
            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Building className="h-6 w-6 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-slate-900 transition-all hover:scale-[1.01]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Role</span>
              <div className="text-lg font-bold capitalize truncate max-w-[130px]">
                {user?.role?.name || 'User'}
              </div>
            </div>
            <div className="h-12 w-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-violet-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-slate-900 transition-all hover:scale-[1.01]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions</span>
              <div className="text-3xl font-extrabold">{directPermsCount}</div>
            </div>
            <div className="h-12 w-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
              <Key className="h-6 w-6 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-slate-900 transition-all hover:scale-[1.01]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MFA Protection</span>
              <div className="text-sm font-bold text-green-500 flex items-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Active
              </div>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Lock className="h-6 w-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Organizations Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-500" />
              Your Organizations
            </h2>
            <Link href="/organizations/create" className="text-xs text-indigo-500 font-semibold hover:underline flex items-center">
              Create New
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          {loadingOrgs ? (
            <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-100 dark:border-slate-800">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : organizations.length === 0 ? (
            <Card className="border-none shadow-md text-center py-12 bg-white dark:bg-slate-900">
              <CardContent className="space-y-4">
                <Building className="h-12 w-12 text-slate-300 mx-auto" />
                <div className="text-slate-800 dark:text-slate-200 font-semibold">No Organizations Found</div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You aren't associated with any organizations yet. Start by creating your own or asking an owner to invite you.
                </p>
                <Link href="/organizations/create">
                  <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold">
                    Create organization
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {organizations.map((org: any) => {
                // Find membership of current user
                const memberCount = org.members?.length || 0;
                return (
                  <Card key={org.id} className="border-none shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300 relative group">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                          {org.name}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono select-all">
                          {org.slug}
                        </CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-500">
                        {org.name[0].toUpperCase()}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                      </div>
                      <Link href="/settings">
                        <Button variant="ghost" size="sm" className="h-8 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-500 font-semibold p-2 rounded-lg">
                          Manage Settings
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions & Security overview */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              <CardDescription>Common platform commands</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                  <Settings className="mr-2 h-4 w-4 text-indigo-500" />
                  Workspace Settings
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                  <User className="mr-2 h-4 w-4 text-violet-500" />
                  Edit User Profile
                </Button>
              </Link>
              <Link href="/organizations/create">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                  <PlusCircle className="mr-2 h-4 w-4 text-pink-500" />
                  Create Organization
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                Active Permissions
              </CardTitle>
              <CardDescription>Permissions granted by your platform role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {directPermsCount === 0 ? (
                <p className="text-xs text-muted-foreground">No specific permissions attached to your role.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {user?.role?.permissions.map((perm: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="font-mono text-[10px] py-0.5 px-1.5 bg-slate-100 dark:bg-slate-800">
                      {perm.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
