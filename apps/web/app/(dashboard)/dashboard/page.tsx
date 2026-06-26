'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  Building, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Settings, 
  PlusCircle, 
  Activity, 
  Lock,
  User,
  Loader2,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from '@/app/actions/project';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeScopeId, setActiveScopeId] = useState<string>('personal');

  // Modal Open/Close States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form Fields
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // 1. Fetch user organizations
  const { data: organizations = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await fetch('/api/organizations');
      if (!res.ok) {
        throw new Error('Failed to load organizations');
      }
      return res.json();
    },
  });

  // 2. Fetch projects in the active scope
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects', activeScopeId],
    queryFn: async () => {
      const url = activeScopeId === 'personal' ? '/api/projects' : `/api/projects?orgId=${activeScopeId}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load projects');
      }
      return res.json();
    },
  });

  // Scoping helpers
  const activeOrg = organizations.find((o: any) => o.id === activeScopeId);
  const userMembership = activeOrg?.members?.find((m: any) => m.userId === user?.id);
  const userRoleInOrg = userMembership?.role?.name || 'member';

  const canManageProjects = activeScopeId === 'personal' || userRoleInOrg === 'owner';
  const activeRoleName = activeScopeId === 'personal' ? 'User' : (userRoleInOrg || 'Member');
  const totalOrgs = organizations.length;

  // Active Permissions based on active scope
  const activeScopePermissions = activeScopeId === 'personal'
    ? user?.role?.permissions || []
    : userRoleInOrg === 'owner'
      ? [
          { name: 'organisation.read', description: 'Read organization details' },
          { name: 'organisation.update', description: 'Update organization details' },
          { name: 'org.members.invite', description: 'Invite members' },
          { name: 'org.members.update', description: 'Update members role' },
          { name: 'org.members.delete', description: 'Remove members' },
          { name: 'org.projects.create', description: 'Create org projects' },
          { name: 'org.projects.read', description: 'Read org projects' },
          { name: 'org.projects.update', description: 'Update org projects' },
          { name: 'org.projects.delete', description: 'Delete org projects' }
        ]
      : [
          { name: 'organisation.read', description: 'Read organization details' },
          { name: 'org.projects.read', description: 'Read org projects' }
        ];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!createName.trim()) throw new Error('Project name is required');
      const orgId = activeScopeId === 'personal' ? undefined : activeScopeId;
      const res = await createProjectAction({ name: createName, description: createDesc }, orgId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success('Project created successfully!');
      setCreateName('');
      setCreateDesc('');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects', activeScopeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editName.trim()) throw new Error('Project name is required');
      const orgId = activeScopeId === 'personal' ? undefined : activeScopeId;
      const res = await updateProjectAction(selectedProject.id, { name: editName, description: editDesc }, orgId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success('Project updated successfully!');
      setSelectedProject(null);
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects', activeScopeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const orgId = activeScopeId === 'personal' ? undefined : activeScopeId;
      const res = await deleteProjectAction(selectedProject.id, orgId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      setSelectedProject(null);
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects', activeScopeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project');
    },
  });

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
              Access your workspaces, manage your scoped projects, and oversee system role permissions in one unified dashboard.
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

      {/* Scope Switcher / Selector */}
      <div className="bg-white/5 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-900 space-y-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold tracking-tight">Select Active Space</h2>
          <p className="text-xs text-slate-400">Filter stats, projects, and permissions by workspace context</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveScopeId('personal')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm",
              activeScopeId === 'personal'
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 border-indigo-500 text-white shadow-indigo-500/20"
                : "border-slate-800 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-white"
            )}
          >
            <User className="h-4 w-4" />
            Personal Space
          </button>

          {loadingOrgs ? (
            <div className="flex items-center justify-center px-4">
              <Loader2 className="h-4.5 w-4.5 text-indigo-500 animate-spin" />
            </div>
          ) : (
            organizations.map((org: any) => (
              <button
                key={org.id}
                onClick={() => setActiveScopeId(org.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm",
                  activeScopeId === org.id
                    ? "bg-gradient-to-r from-violet-500 to-pink-500 border-violet-500 text-white shadow-violet-500/20"
                    : "border-slate-800 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-white"
                )}
              >
                <Building className="h-4 w-4" />
                {org.name}
              </button>
            ))
          )}
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
                {activeRoleName}
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
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects ({activeScopeId === 'personal' ? 'Personal' : 'Org'})</span>
              <div className="text-3xl font-extrabold">{projects.length}</div>
            </div>
            <div className="h-12 w-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-pink-500" />
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
        {/* Projects Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-indigo-500" />
              Workspace Projects
            </h2>
            {canManageProjects ? (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl"
              >
                <PlusCircle className="mr-2 h-4.5 w-4.5" />
                New Project
              </Button>
            ) : (
              <Badge variant="outline" className="border-slate-800 bg-slate-900/30 text-slate-400 py-1.5 px-3">
                Read-Only Workspace
              </Badge>
            )}
          </div>

          {loadingProjects ? (
            <div className="flex items-center justify-center py-16 bg-slate-900/20 rounded-2xl border border-slate-900">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <Card className="border-none shadow-md text-center py-16 bg-white dark:bg-slate-900">
              <CardContent className="space-y-4">
                <Activity className="h-12 w-12 text-slate-400 dark:text-slate-650 mx-auto" />
                <div className="text-slate-800 dark:text-slate-200 font-semibold text-lg">No Projects Found</div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  There are no projects in this workspace yet. {canManageProjects ? 'Create a project to get started!' : 'Ask the organization owner to create one.'}
                </p>
                {canManageProjects && (
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
                  >
                    Create first project
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project: any) => (
                <Card key={project.id} className="border-none shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                        {project.name}
                      </CardTitle>
                      {project.description ? (
                        <CardDescription className="text-xs line-clamp-2">
                          {project.description}
                        </CardDescription>
                      ) : (
                        <CardDescription className="text-xs italic text-slate-500">
                          No description provided
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-4 mt-auto">
                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                    {canManageProjects && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setEditName(project.name);
                            setEditDesc(project.description || '');
                            setIsEditOpen(true);
                          }}
                          className="h-8 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-500 font-semibold rounded-lg text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-semibold rounded-lg text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions & Security/Permissions overview */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              <CardDescription>Common platform commands</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                  <Settings className="mr-2 h-4 w-4 text-indigo-500" />
                  Workspace Settings
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                  <User className="mr-2 h-4 w-4 text-violet-500" />
                  Edit User Profile
                </Button>
              </Link>
              <Link href="/organizations/create">
                <Button variant="outline" className="w-full justify-start rounded-xl border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
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
              <CardDescription>Permissions granted in {activeScopeId === 'personal' ? 'Personal Space' : 'this Organization'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeScopePermissions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No permissions attached to your active role.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {activeScopePermissions.map((perm: any, idx: number) => (
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

      {/* CREATE PROJECT MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create New Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new project scoped to your {activeScopeId === 'personal' ? 'Personal Space' : 'active Organization'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Project Name</Label>
              <Input
                id="name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Authentication API Integration"
                className="bg-slate-950 border-slate-800 text-white rounded-lg focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">Description (Optional)</Label>
              <Input
                id="description"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="e.g. Integration with NestJS backend"
                className="bg-slate-950 border-slate-800 text-white rounded-lg focus-visible:ring-indigo-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT PROJECT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update details for project <span className="font-semibold text-white">{selectedProject?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-semibold">Project Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Project Name"
                className="bg-slate-950 border-slate-800 text-white rounded-lg focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-semibold">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Project Description"
                className="bg-slate-950 border-slate-800 text-white rounded-lg focus-visible:ring-indigo-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => editMutation.mutate()}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE PROJECT MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-500">Delete Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete <span className="font-semibold text-white">{selectedProject?.name}</span>? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteMutation.mutate()}
              className="bg-red-500 hover:bg-red-650 text-white font-semibold"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
