'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { acceptInvitationAction, rejectInvitationAction } from '@/app/actions/org';
import { toast } from 'sonner';
import { Building, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="max-w-md w-full border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
          <CardHeader className="space-y-1 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle className="text-xl font-bold">Invalid Link</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              The invitation link you followed is invalid or missing a token.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-sm text-slate-400 mb-6">
              Please check the email invitation link and make sure it has not been modified.
            </p>
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold w-full rounded-xl"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAccept = async () => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const res = await acceptInvitationAction(token);
      if (res.success) {
        setStatus('success');
        toast.success('Joined organization successfully!');
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Failed to accept invitation');
        toast.error(res.error || 'Failed to accept invitation');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    }
  };

  const handleDecline = async () => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const res = await rejectInvitationAction(token);
      if (res.success) {
        toast.info('Invitation declined.');
        router.push('/dashboard');
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Failed to decline invitation');
        toast.error(res.error || 'Failed to decline invitation');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 animate-in fade-in duration-500">
      <Card className="max-w-md w-full border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden transition-all hover:scale-[1.01]">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x" />
        
        {status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-emerald-500 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome onboard!</h2>
              <p className="text-sm text-muted-foreground">Successfully joined the organization.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-500 font-semibold pt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting you to dashboard...
            </div>
          </div>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center flex flex-col items-center">
              <div className="h-14 w-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-3">
                <Building className="h-7 w-7 text-indigo-500" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Join Organization</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                You have been invited to collaborate with this team workspace.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                By accepting this invitation, you will gain access to the organization's projects, workspace materials, and member list in accordance with your assigned role.
              </p>
              
              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs text-left flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error:</span> {errorMessage}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col gap-2.5 pb-8 pt-4">
              <Button
                onClick={handleAccept}
                disabled={status === 'loading'}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold h-11 rounded-xl shadow-lg shadow-indigo-500/15"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Accept Invitation'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={status === 'loading'}
                className="w-full border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold h-11 rounded-xl"
              >
                Decline
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
