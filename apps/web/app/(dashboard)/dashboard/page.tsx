'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your secure workspace.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
            <CardDescription>Your current security profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role</span>
              <Badge variant="secondary" className="capitalize">{user?.role?.name || 'User'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Security</span>
              <Badge variant="outline" className="text-green-500 border-green-500">MFA Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Overview of your account logins</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    No recent activity to show.
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
