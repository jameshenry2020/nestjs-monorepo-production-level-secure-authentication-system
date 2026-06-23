'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { verifyEmailAction, resendOtpAction } from '@/app/actions/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');

  const verifyMutation = useMutation({
    mutationFn: async (values: { email: string; otp: string }) => {
      const result = await verifyEmailAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Email verified successfully! You can now log in.');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid or expired OTP');
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const result = await resendOtpAction(email);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('New OTP sent to your email.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resend OTP');
    },
  });

  const handleVerify = () => {
    if (!email || !otp) return;
    verifyMutation.mutate({ email, otp });
  };

  const handleResend = () => {
    if (!email) return;
    resendMutation.mutate(email);
  };

  if (!email) {
    return (
      <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <CardContent className="pt-6">
          <p className="text-center text-red-500">No email provided. Please sign up again.</p>
          <Button variant="link" onClick={() => router.push('/signup')} className="w-full mt-4">
            Go to Sign Up
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <CardHeader className="space-y-1 flex flex-col items-center text-center">
        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Verify your email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col items-center">
        <div className="w-full">
            <Input 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Enter 6-digit code" 
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14 bg-slate-50/50 dark:bg-slate-800/50"
            />
        </div>
        <Button 
            className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01]" 
            onClick={handleVerify}
            disabled={verifyMutation.isPending || otp.length !== 6}
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Didn't receive the code?{' '}
          <button 
            onClick={handleResend}
            className="text-primary hover:underline font-medium disabled:opacity-50"
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
