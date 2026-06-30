'use client';

import { useState, Suspense } from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { loginAction, authenticate2FAAction } from '@/app/actions/auth';
import { Eye, EyeOff } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA login states
  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [isSubmittingMfa, setIsSubmittingMfa] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof loginSchema>) => {
      const result = await loginAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      if (result.require2FA) {
        setTwoFactorToken(result.twoFactorToken || '');
        setStep('mfa');
        toast.info('Two-Factor Authentication required. Please enter verification code.');
      } else {
        if (result.user) {
          setAuth(result.user);
        }
        toast.success('Successfully logged in!');
        if (token) {
          router.push(`/organizations/invitations/accept?token=${token}`);
        } else {
          router.push('/dashboard');
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid credentials');
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    mutation.mutate(values);
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      setMfaError('Code must be exactly 6 digits');
      return;
    }
    setIsSubmittingMfa(true);
    setMfaError('');
    try {
      const result = await authenticate2FAAction(twoFactorToken, mfaCode);
      if (result.success && result.user) {
        setAuth(result.user);
        toast.success('Successfully logged in!');
        if (token) {
          router.push(`/organizations/invitations/accept?token=${token}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        setMfaError(result.error || 'Invalid verification code');
        toast.error(result.error || 'Verification failed');
      }
    } catch (err: any) {
      setMfaError(err.message || 'An error occurred during verification');
    } finally {
      setIsSubmittingMfa(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  if (step === 'mfa') {
    return (
      <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-indigo-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-indigo-500"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit verification code from your authenticator app or one of your backup recovery codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMfaSubmit} className="space-y-6 flex flex-col items-center">
            <div className="space-y-2 w-full flex flex-col items-center">
              <label htmlFor="mfa-input" className="text-sm font-semibold text-muted-foreground self-start pl-2">
                Verification Code
              </label>
              
              <InputOTP
                maxLength={6}
                value={mfaCode}
                onChange={(val) => {
                  setMfaCode(val);
                  if (mfaError) setMfaError('');
                }}
                disabled={isSubmittingMfa}
                containerClassName="flex justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {mfaError && (
                <p className="text-xs text-red-500 font-medium mt-1.5 self-start pl-2">{mfaError}</p>
              )}
            </div>

            <div className="w-full space-y-3">
              <Button type="submit" className="w-full h-11 text-base font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all hover:scale-[1.01]" disabled={isSubmittingMfa || mfaCode.length < 6}>
                {isSubmittingMfa ? "Verifying..." : "Verify & Sign In"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                onClick={() => {
                  setStep('login');
                  setMfaCode('');
                  setMfaError('');
                }}
                disabled={isSubmittingMfa}
              >
                Back to Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <CardHeader className="space-y-1 flex flex-col items-center text-center">
        <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary-foreground"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 gap-6">
          <Button variant="outline" onClick={handleGoogleLogin} className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="**********"
                        {...field}
                        className="bg-slate-50/50 dark:bg-slate-800/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01]" disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center text-muted-foreground w-full">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-slate-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
