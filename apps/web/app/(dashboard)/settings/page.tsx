'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { 
  inviteMemberAction, 
  updateMemberRoleAction, 
  removeMemberAction 
} from '@/app/actions/org';
import { 
  createPermissionAction, 
  assignRolePermissionsAction, 
  assignUserPermissionsAction 
} from '@/app/actions/perm';
import { 
  Building, 
  Users, 
  UserPlus, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Key,
  Shield,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Validations
const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const createPermissionSchema = z.object({
  name: z.string().min(3, 'Permission name must be at least 3 characters'),
  module: z.string().min(2, 'Module name is required'),
  description: z.string().optional(),
});

const assignPermissionSchema = z.object({
  roleId: z.string().min(1, 'Role ID/Name is required'),
  permissions: z.string().min(1, 'Permissions list is required'),
});

const assignUserPermissionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  permissions: z.string().min(1, 'Permissions list is required'),
});

export default function SettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('org-settings');

  // Check if user is Platform Admin (role === admin or email ends with admin)
  const isPlatformAdmin = user?.role?.name === 'admin';

  // 1. Fetch user organizations from local Route Handler
  const { data: organizations = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await fetch('/api/organizations');
      if (!res.ok) {
        throw new Error('Failed to load organizations');
      }
      const data = await res.json();
      if (data.length > 0 && !selectedOrgId) {
        setSelectedOrgId(data[0].id);
      }
      return data;
    },
  });

  const selectedOrg = organizations.find((o: any) => o.id === selectedOrgId);

  // 2. Fetch organization members from local Route Handler
  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['members', selectedOrgId],
    queryFn: async () => {
      if (!selectedOrgId) return [];
      const res = await fetch(`/api/organizations/${selectedOrgId}/members`);
      if (!res.ok) {
        throw new Error('Failed to load members');
      }
      return res.json();
    },
    enabled: !!selectedOrgId,
  });

  // 3. Admin-only: Fetch all permissions from local Route Handler
  const { data: permissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      if (!isPlatformAdmin) return [];
      const res = await fetch('/api/permissions');
      if (!res.ok) {
        throw new Error('Failed to load permissions');
      }
      return res.json();
    },
    enabled: isPlatformAdmin,
  });

  // 4. Admin-only: Fetch all platform users from local Route Handler
  const { data: platformUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['platform-users'],
    queryFn: async () => {
      if (!isPlatformAdmin) return [];
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('Failed to load users');
      }
      return res.json();
    },
    enabled: isPlatformAdmin,
  });

  // Forms
  const inviteForm = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' },
  });

  const permForm = useForm<z.infer<typeof createPermissionSchema>>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: { name: '', module: '', description: '' },
  });

  const assignRoleForm = useForm<z.infer<typeof assignPermissionSchema>>({
    resolver: zodResolver(assignPermissionSchema),
    defaultValues: { roleId: '', permissions: '' },
  });

  const assignUserForm = useForm<z.infer<typeof assignUserPermissionSchema>>({
    resolver: zodResolver(assignUserPermissionSchema),
    defaultValues: { userId: '', permissions: '' },
  });

  // Mutations calling Server Actions
  const inviteMutation = useMutation({
    mutationFn: async (values: z.infer<typeof inviteSchema>) => {
      const result = await inviteMemberAction(selectedOrgId, values.email);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Invitation email sent successfully!');
      inviteForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to send invitation');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberUserId, roleName }: { memberUserId: string; roleName: string }) => {
      const result = await updateMemberRoleAction(selectedOrgId, memberUserId, roleName);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Member role updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['members', selectedOrgId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update member role');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberUserId: string) => {
      const result = await removeMemberAction(selectedOrgId, memberUserId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Member removed from organization.');
      queryClient.invalidateQueries({ queryKey: ['members', selectedOrgId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to remove member');
    },
  });

  const createPermissionMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createPermissionSchema>) => {
      const result = await createPermissionAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('New permission created successfully.');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      permForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create permission');
    },
  });

  const assignRolePermMutation = useMutation({
    mutationFn: async (values: z.infer<typeof assignPermissionSchema>) => {
      const permsArray = values.permissions.split(',').map(s => s.trim()).filter(Boolean);
      const result = await assignRolePermissionsAction(values.roleId, permsArray);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Permissions assigned to role successfully.');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      assignRoleForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to assign permissions');
    },
  });

  const assignUserPermMutation = useMutation({
    mutationFn: async (values: z.infer<typeof assignUserPermissionSchema>) => {
      const permsArray = values.permissions.split(',').map(s => s.trim()).filter(Boolean);
      const result = await assignUserPermissionsAction(values.userId, permsArray);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Direct user permissions updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      assignUserForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to assign user permissions');
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Settings Workspace</h1>
        <p className="text-muted-foreground">Manage organization settings, members, and platform role permissions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="org-settings" className="px-4 py-2 font-medium">
            <Building className="h-4 w-4 mr-2" />
            Organization Settings
          </TabsTrigger>
          {isPlatformAdmin && (
            <TabsTrigger value="platform-permissions" className="px-4 py-2 font-medium">
              <Shield className="h-4 w-4 mr-2" />
              Platform Permissions (Admin)
            </TabsTrigger>
          )}
        </TabsList>

        {/* ORGANIZATION SETTINGS TAB */}
        <TabsContent value="org-settings" className="space-y-6">
          {loadingOrgs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : organizations.length === 0 ? (
            <Card className="border-none shadow-xl text-center py-12 bg-white dark:bg-slate-900">
              <CardContent className="space-y-4">
                <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Building className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold">No organizations found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  You are not a member of any organization yet. Create one to get started.
                </p>
                <Button onClick={() => window.location.href = '/organizations/create'} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Organization list & info */}
              <div className="space-y-6">
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Select Organization</CardTitle>
                    <CardDescription>Switch active workspace settings context</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {organizations.map((org: any) => (
                      <button
                        key={org.id}
                        onClick={() => setSelectedOrgId(org.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          selectedOrgId === org.id
                            ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400 font-semibold shadow-sm'
                            : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold ${
                            selectedOrgId === org.id ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            {org.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm text-slate-800 dark:text-slate-100 font-medium truncate max-w-[150px]">{org.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{org.slug}</div>
                          </div>
                        </div>
                        {selectedOrgId === org.id && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Invite Member form */}
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <UserPlus className="h-4.5 w-4.5 text-indigo-500" />
                      Invite Member
                    </CardTitle>
                    <CardDescription>Only workspace owners can invite members.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...inviteForm}>
                      <form onSubmit={inviteForm.handleSubmit((v) => inviteMutation.mutate(v))} className="space-y-4">
                        <FormField
                          control={inviteForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User Email</FormLabel>
                              <FormControl>
                                <Input placeholder="colleague@company.com" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold" 
                          disabled={inviteMutation.isPending}
                        >
                          {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Members listing and editing */}
              <div className="lg:col-span-2">
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Workspace Members</CardTitle>
                      <CardDescription>
                        Managing team for <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrg?.name}</span>
                      </CardDescription>
                    </div>
                    <div className="h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-center font-semibold text-muted-foreground font-mono">
                      Slug: {selectedOrg?.slug}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingMembers ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No members found.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-850 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                              <th className="pb-3 pr-4">User</th>
                              <th className="pb-3 px-4">Role</th>
                              <th className="pb-3 pl-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                            {members.map((member: any) => (
                              <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                <td className="py-3.5 pr-4">
                                  <div className="font-medium text-slate-800 dark:text-slate-100">
                                    {member.user.name || 'Anonymous User'}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-mono">{member.user.email}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <select
                                    value={member.role.name}
                                    onChange={(e) => updateRoleMutation.mutate({ memberUserId: member.user.id, roleName: e.target.value })}
                                    className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-lg p-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                                  >
                                    <option value="owner">Owner</option>
                                    <option value="member">Member</option>
                                  </select>
                                </td>
                                <td className="py-3.5 pl-4 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to remove ${member.user.email}?`)) {
                                        removeMemberMutation.mutate(member.user.id);
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50/20 rounded-lg h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* PLATFORM PERMISSIONS TAB */}
        {isPlatformAdmin && (
          <TabsContent value="platform-permissions" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* List Permissions */}
              <Card className="border-none shadow-xl bg-white dark:bg-slate-900 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Global System Permissions</CardTitle>
                  <CardDescription>List of all platform permissions seeded in the database</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPermissions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                    </div>
                  ) : permissions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No permissions configured.</div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {permissions.map((perm: any) => (
                        <div key={perm.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded">
                              {perm.module}
                            </span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-mono">
                              {perm.name}
                            </span>
                          </div>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground leading-snug">{perm.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Create Permission Form */}
              <div className="space-y-6">
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Plus className="h-4.5 w-4.5 text-indigo-500" />
                      Create Permission
                    </CardTitle>
                    <CardDescription>Register a new system permission key</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...permForm}>
                      <form onSubmit={permForm.handleSubmit((v) => createPermissionMutation.mutate(v))} className="space-y-4">
                        <FormField
                          control={permForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permission Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. project.delete" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={permForm.control}
                          name="module"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Module Category</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. project" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={permForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Describe permission scope" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold" 
                          disabled={createPermissionMutation.isPending}
                        >
                          Create Permission
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Assign Permissions to Role Form */}
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldAlert className="h-4.5 w-4.5 text-indigo-500" />
                      Assign to Platform Role
                    </CardTitle>
                    <CardDescription>Assign permission list to specific Role UUID</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...assignRoleForm}>
                      <form onSubmit={assignRoleForm.handleSubmit((v) => assignRolePermMutation.mutate(v))} className="space-y-4">
                        <FormField
                          control={assignRoleForm.control}
                          name="roleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter role UUID" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={assignRoleForm.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permissions</FormLabel>
                              <FormControl>
                                <Input placeholder="settings.read, project.create" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                              </FormControl>
                              <FormDescription>Comma-separated list of names</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold" 
                          disabled={assignRolePermMutation.isPending}
                        >
                          Assign Permissions
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
