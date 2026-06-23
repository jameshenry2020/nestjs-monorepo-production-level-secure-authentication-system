'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import {
  Shield,
  Key,
  Users,
  Zap,
  Lock,
  Building,
  ArrowRight,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AuthSystem
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-400 hidden sm:inline-block">
                  Signed in as <span className="font-semibold text-slate-200">{user?.email}</span>
                </span>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25 border-none font-medium rounded-lg px-4 h-9">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/signup">
                  <Button className="bg-white hover:bg-slate-100 text-slate-900 border-none font-semibold rounded-lg px-4 h-9 shadow-md shadow-white/5 transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center">
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-400 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Production-Ready Secure Authentication
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.15] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Secure, Multi-Tenant Auth <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Built for Scale & Enterprise
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            A secure authentication and user management monorepo powered by NestJS, Next.js, and Prisma. Experience seamless session handling, granular RBAC, MFA, and multi-tenant organizations.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold rounded-xl px-8 h-12 text-base shadow-xl shadow-indigo-500/20">
                  Access Workspace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold rounded-xl px-8 h-12 text-base shadow-xl shadow-indigo-500/20">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-200 font-semibold rounded-xl px-8 h-12 text-base">
                    Live Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Interactive Preview Dashboard Mockup */}
          <div className="w-full max-w-5xl mt-16 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-2xl backdrop-blur-xl group hover:border-slate-700 transition-all duration-500">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs text-slate-500 font-mono">authsystem-v1.0.0.config</div>
              <div className="w-8" />
            </div>
            <div className="aspect-[16/9] w-full rounded-lg bg-slate-950 p-6 flex flex-col justify-between text-left overflow-hidden relative">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-slate-900 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-indigo-500/20 rounded-lg border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-400 font-mono">
                    active_session
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/20 space-y-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 font-medium">MFA Security</div>
                      <div className="text-[10px] text-green-400 flex items-center gap-1 font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Enabled
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/20 space-y-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 font-medium">Organization</div>
                      <div className="text-[10px] text-slate-400 font-mono">Acme Corp</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/20 space-y-3">
                    <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Settings className="h-4 w-4 text-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 font-medium">Role Matrix</div>
                      <div className="text-[10px] text-indigo-400 font-mono">Admin Privileges</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-900/80 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">IP: 192.168.1.104</span>
                <span className="font-mono">Token expires in 59m 40s</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-slate-900 flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Enterprise Auth, Made Simple
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Equipped with state-of-the-art mechanisms to guarantee security, fast response times, and customizable user logic.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Secure OTP Verification</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dual factor verification using timed passcode tokens delivered to user email automatically upon registry.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Multi-Tenant Organizations</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Create multiple workspaces or companies, invite users by email, and update their roles on the fly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Granular Role & RBAC Matrix</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Define access lists, assign permissions to roles, and override specific roles directly for individual users.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Google OAuth 2.0 Integration</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Allow passwordless signup and logins securely using official Google Identity providers with state checks.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Key className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">JWT Session Refresh Flow</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stateless access handling with refresh timers, secure storage, and auto-refresh request interceptors.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Full Audit Logs & BullMQ</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Asynchronous event processing for email notifications and actions using Redis and background message queues.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Stack / Architecture section */}
        <section id="architecture" className="w-full bg-slate-900/30 border-t border-b border-slate-900 py-24">
          <div className="max-w-7xl mx-auto px-6 grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Architected with Modern Tech Stack
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Built to support high throughput and clean domain boundaries. By segregating background worker tasks and utilizing database query indexes, API latency is minimized.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span><strong>Next.js App Router</strong> with Tailwind CSS for layout rendering</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span><strong>NestJS Backend</strong> implementing modular architecture & REST APIs</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span><strong>Prisma ORM</strong> with custom indexes for user and workspace queries</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span><strong>Redis & BullMQ</strong> for asynchronous worker background queues</span>
                </li>
              </ul>
            </div>

            {/* Visual Architecture Representation */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-8 flex flex-col gap-6 justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">FE</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Next.js Client</div>
                    <div className="text-[10px] text-slate-500 font-mono">Next.js 16 + Zustand + React Query</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center font-bold text-violet-400">BE</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">NestJS Gateway</div>
                    <div className="text-[10px] text-slate-500 font-mono">Passport JWT + Guards + Modules</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center font-bold text-pink-400">DB</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">PostgreSQL Store</div>
                    <div className="text-[10px] text-slate-500 font-mono">Prisma Client • Row indexing</div>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-slate-900 rounded flex items-center justify-center border border-slate-800">
              <Shield className="h-3 w-3 text-slate-400" />
            </div>
            <span className="font-bold text-slate-400">AuthSystem</span>
          </div>
          <p>© {new Date().getFullYear()} AuthSystem. All rights reserved.</p>

        </div>
      </footer>
    </div>
  );
}
