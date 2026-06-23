'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Building, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { createOrganizationAction } from '@/app/actions/org';

const createOrgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(256, 'Max 256 characters'),
});

export default function CreateOrganizationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createOrgSchema>>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
    },
  });

  const nameValue = form.watch('name');

  // Slug preview helper
  const generateSlugPreview = (name: string) => {
    if (!name) return 'your-organization-slug';
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof createOrgSchema>) => {
      const result = await createOrganizationAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(`Organization "${data.name}" created successfully!`);
      // Invalidate organizations list query
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create organization');
    },
  });

  function onSubmit(values: z.infer<typeof createOrgSchema>) {
    mutation.mutate(values);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg border border-slate-200 dark:border-slate-800">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Create Organization</h1>
          <p className="text-sm text-muted-foreground">Set up a new shared tenant workspace.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-xl bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Organization Details</CardTitle>
            <CardDescription>
              Enter the name for your organization. Once created, you will be configured as the Owner role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Acme Corporation" 
                          {...field} 
                          className="bg-slate-50/50 dark:bg-slate-800/50 h-11"
                        />
                      </FormControl>
                      <FormDescription>
                        This is the display name of your company or workspace.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Slug Preview (URL identifier)
                  </div>
                  <div className="font-mono text-sm text-indigo-500 dark:text-indigo-400 font-semibold break-all">
                    /organizations/{generateSlugPreview(nameValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This slug is automatically generated to form unique, search-friendly URLs for your resources.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/20 border-none transition-all hover:scale-[1.01]" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating Workspace..." : "Create Workspace"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Feature info card */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 h-fit">
          <CardHeader className="pb-3">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-2">
              <Building className="h-5 w-5 text-indigo-400" />
            </div>
            <CardTitle className="text-base font-bold">Multi-Tenancy</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Why create an organization?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-400 leading-relaxed">
            <div className="flex gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-200 block font-medium">Collaborative Spaces</strong>
                Invite members and assign custom roles to manage projects jointly.
              </p>
            </div>
            <div className="flex gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-200 block font-medium">Isolated Environments</strong>
                Data in your organization remains completely isolated from other users' accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
