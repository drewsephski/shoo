"use client";

import { useState, useEffect } from "react";
import { useShooAuth } from "@/lib/shoo-convex";
import Head from "next/head";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type AuthState = "idle" | "typing" | "submitting" | "verifying" | "success" | "dashboard";

export default function Hero() {
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [activeStep, setActiveStep] = useState(0);
  const { signIn, identity, loading } = useShooAuth();

  const isAuthenticated = !loading && !!identity?.userId;

  // Auto-demo animation - premium timing
  useEffect(() => {
    const sequence = async () => {
      // Longer initial pause for premium feel
      await new Promise(r => setTimeout(r, 2000));
      setAuthState("typing");

      // Type email - slower, more deliberate
      const emailText = "sarah@example.com";
      for (let i = 0; i <= emailText.length; i++) {
        await new Promise(r => setTimeout(r, 100));
        setEmail(emailText.slice(0, i));
      }

      await new Promise(r => setTimeout(r, 600));

      // Type password - rhythmic
      const passText = "••••••••••";
      for (let i = 0; i <= passText.length; i++) {
        await new Promise(r => setTimeout(r, 80));
        setPassword(passText.slice(0, i));
      }

      await new Promise(r => setTimeout(r, 800));
      setAuthState("submitting");

      // Extended loading for premium feel
      await new Promise(r => setTimeout(r, 1800));
      setAuthState("verifying");

      // Type 2FA code - staggered elegance
      const demoCode = "7 4 9 2 8 1".split(" ");
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 300));
        setCode(prev => {
          const next = [...prev];
          next[i] = demoCode[i];
          return next;
        });
        setActiveStep(i + 1);
      }

      await new Promise(r => setTimeout(r, 900));
      setAuthState("success");

      // Longer success dwell
      await new Promise(r => setTimeout(r, 3000));

      // Show dashboard
      setAuthState("dashboard");
      await new Promise(r => setTimeout(r, 4000));
      
      // Graceful reset
      setEmail("");
      setPassword("");
      setCode(["", "", "", "", "", ""]);
      setActiveStep(0);
      setAuthState("idle");
    };

    const interval = setInterval(sequence, 15000);
    sequence();
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Shoo Auth</title>
      </Head>

      <style jsx global>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .font-serif {
          font-family: var(--font-instrument-serif), Georgia, serif;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

            <div className="bg-stone-100 text-stone-900 antialiased">
                <main>
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center px-4 pb-4 pt-28">
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-4 py-1.5 text-[13px] text-amber-700 shadow-sm backdrop-blur-sm"
                            style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Early WIP — Use at your own risk
                        </div>

                        <h1
                            className="relative z-10 max-w-4xl text-center text-[#1C1917]"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
                        >
                            <span className="block font-serif text-[clamp(48px,8vw,88px)] leading-[1.05] tracking-[-0.02em]">Auth infrastructure.</span>
                            <span className="block font-serif text-[clamp(48px,8vw,88px)] leading-[1.05] tracking-[-0.02em] text-stone-400">Without the headache.</span>
                        </h1>
                        <p
                            className="relative z-10 mt-4 max-w-xl px-4 text-center text-[15px] leading-relaxed text-stone-600 sm:mt-6 sm:text-[18px]"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both" }}
                        >
                            Hosted authentication built on Shoo. Sessions, audit logs, and team management — the production features you actually need.
                        </p>
                        <div
                            className="relative z-20 mt-8 flex flex-col items-center"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both" }}
                        >
                            {isAuthenticated ? (
                                <Button
                                    asChild
                                    variant="blue-cta"
                                    effect="expandIcon"
                                    icon={ArrowRight}
                                    iconPlacement="right"
                                    className="rounded-2xl px-8 py-4 text-[16px] font-semibold"
                                >
                                    <Link href="/dashboard">Dashboard</Link>
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => signIn({ requestPii: true })}
                                    variant="blue-cta"
                                    effect="expandIcon"
                                    icon={ArrowRight}
                                    iconPlacement="right"
                                    className="rounded-2xl px-8 py-4 text-[16px] font-semibold"
                                >
                                    Get Started
                                </Button>
                            )}
                            <div className="mt-4">
                            </div>
                        </div>
                    </section>

                    {/* App Preview Section - Minimal Premium */}
                    <section className="relative px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-12">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(120,113,108,0.03),transparent_50%)]"></div>
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
                        </div>

                        {/* How it works label */}
                        <div 
                            className="mx-auto mb-6 flex max-w-xl items-center justify-center gap-3"
                            style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both" }}
                        >
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-300"></div>
                            <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                                <span className="text-sm font-medium text-stone-700">See how it works</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-300"></div>
                        </div>

                        <div
                            className="relative mx-auto max-w-xl"
                            style={{ animation: "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both" }}
                        >
                            {/* Live demo badge */}
                            <div className="absolute -top-3 left-6 z-10">
                                <div className="flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-lg shadow-blue-600/25">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                                    </span>
                                    Live demo
                                </div>
                            </div>

                            <div className="rounded-2xl border border-stone-200 bg-white p-8 pt-10 shadow-xl shadow-stone-200/50 sm:p-10 sm:pt-12">
                                {/* Clean Header */}
                                <div className="mb-8 text-center">
                                    <h3 className="font-serif text-2xl font-medium tracking-tight text-stone-900">
                                        OAuth in 2 lines
                                    </h3>
                                    <p className="mt-2 text-sm text-stone-500">
                                        Add the script. Add a login link. Done.
                                    </p>
                                </div>

                                {/* Auth Demo Card */}
                                <div className="relative rounded-xl border border-stone-100 bg-stone-50/50 p-6 overflow-hidden">
                                    {/* Progress bar at top */}
                                    <div className="absolute left-0 right-0 top-0 h-1 bg-stone-100">
                                        <motion.div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                                            initial={{ width: "0%" }}
                                            animate={{ 
                                                width: authState === 'idle' ? "0%" :
                                                       authState === 'typing' ? "20%" :
                                                       authState === 'submitting' ? "40%" :
                                                       authState === 'verifying' ? "60%" :
                                                       authState === 'success' ? "80%" :
                                                       "100%"
                                            }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    </div>

                                    {/* Status Indicator */}
                                    <div className="mb-6 flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="h-2 w-2 rounded-full transition-colors duration-500"
                                                style={{
                                                    backgroundColor: authState === 'success' ? '#10b981' : authState === 'dashboard' ? '#10b981' : authState === 'idle' ? '#9ca3af' : '#3b82f6',
                                                    boxShadow: authState === 'success' || authState === 'dashboard' ? '0 0 8px #10b981' : authState === 'idle' ? 'none' : '0 0 8px #3b82f6'
                                                }}
                                            />
                                            <span className="text-xs font-medium text-stone-600">
                                                {authState === 'idle' && 'Ready to authenticate...'}
                                                {authState === 'typing' && 'Redirecting to shooauth.com...'}
                                                {authState === 'submitting' && 'Completing OAuth flow...'}
                                                {authState === 'verifying' && 'Verifying identity token...'}
                                                {authState === 'success' && 'Authentication successful'}
                                                {authState === 'dashboard' && 'Session active'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {['idle', 'typing', 'submitting', 'verifying', 'success', 'dashboard'].map((step, idx) => {
                                                const currentIdx = ['idle', 'typing', 'submitting', 'verifying', 'success', 'dashboard'].indexOf(authState);
                                                const isActive = idx === currentIdx;
                                                const isComplete = idx < currentIdx;
                                                return (
                                                    <div 
                                                        key={step}
                                                        className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                                                        style={{
                                                            backgroundColor: isComplete ? '#10b981' : isActive ? '#3b82f6' : '#e5e7eb'
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Auth Visual */}
                                    <div className="space-y-4">
                                        {/* Email Field */}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Email</label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={email}
                                                    readOnly
                                                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition-all duration-200 group-hover:border-stone-300"
                                                    style={{
                                                        boxShadow: email.length > 0 && authState !== 'idle' 
                                                            ? '0 0 0 3px rgba(59, 130, 246, 0.1), inset 0 1px 2px rgba(0,0,0,0.02)' 
                                                            : 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                                    }}
                                                    placeholder="sarah@example.com"
                                                />
                                                {email.length > 0 && authState !== 'idle' && (
                                                    <motion.div 
                                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                                                            <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Password</label>
                                            <div className="relative group">
                                                <input
                                                    type="password"
                                                    value={password}
                                                    readOnly
                                                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition-all duration-200 group-hover:border-stone-300"
                                                    style={{
                                                        boxShadow: password.length > 5 && authState !== 'idle'
                                                            ? '0 0 0 3px rgba(59, 130, 246, 0.1), inset 0 1px 2px rgba(0,0,0,0.02)'
                                                            : 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                                    }}
                                                    placeholder="••••••••••"
                                                />
                                                {password.length > 5 && authState !== 'idle' && (
                                                    <motion.div 
                                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                                                            <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 2FA - Shown inline when active */}
                                        <div 
                                            className="overflow-hidden transition-all duration-500"
                                            style={{
                                                maxHeight: authState === 'verifying' || authState === 'success' ? '100px' : '0',
                                                opacity: authState === 'verifying' || authState === 'success' ? 1 : 0
                                            }}
                                        >
                                            <div className="pt-2">
                                                <label className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Verification code</label>
                                                <div className="mt-1.5 flex gap-2">
                                                    {code.map((digit, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex h-10 w-8 items-center justify-center rounded-md border text-sm font-medium"
                                                            style={{
                                                                borderColor: digit ? '#10b981' : '#e5e7eb',
                                                                backgroundColor: digit ? '#f0fdf4' : 'white',
                                                                color: digit ? '#059669' : '#374151',
                                                                transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)'
                                                            }}
                                                        >
                                                            {digit}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Success State */}
                                        <div 
                                            className="overflow-hidden transition-all duration-500"
                                            style={{
                                                maxHeight: authState === 'success' ? '200px' : '0',
                                                opacity: authState === 'success' ? 1 : 0
                                            }}
                                        >
                                            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-stone-900">Theo GG</p>
                                                        <p className="text-xs text-stone-500">Session active · 3 devices</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dashboard State - Mini Dashboard Preview */}
                                        <div 
                                            className="overflow-hidden transition-all duration-700"
                                            style={{
                                                maxHeight: authState === 'dashboard' ? '400px' : '0',
                                                opacity: authState === 'dashboard' ? 1 : 0
                                            }}
                                        >
                                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5">
                                                {/* Dashboard Header */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                                                        <span className="text-sm font-semibold text-white">SF</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-stone-900">Theo</p>
                                                        <p className="text-xs text-stone-500">theo@gg.com</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600 border border-emerald-100">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Session Stats */}
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    <div className="rounded-lg bg-white border border-stone-100 p-3 text-center">
                                                        <p className="text-lg font-semibold text-stone-900">3</p>
                                                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Devices</p>
                                                    </div>
                                                    <div className="rounded-lg bg-white border border-stone-100 p-3 text-center">
                                                        <p className="text-lg font-semibold text-stone-900">12</p>
                                                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Apps</p>
                                                    </div>
                                                    <div className="rounded-lg bg-white border border-stone-100 p-3 text-center">
                                                        <p className="text-lg font-semibold text-stone-900">2d</p>
                                                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Session</p>
                                                    </div>
                                                </div>

                                                {/* Active Sessions */}
                                                <div className="space-y-2">
                                                    <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Active Sessions</p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3 rounded-lg bg-white border border-stone-100 p-2.5">
                                                            <div className="h-7 w-7 rounded-md bg-stone-100 flex items-center justify-center">
                                                                <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-stone-900">MacBook Pro</p>
                                                                <p className="text-[10px] text-stone-500 truncate">Chrome • San Francisco, CA</p>
                                                            </div>
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                                        </div>
                                                        <div className="flex items-center gap-3 rounded-lg bg-white border border-stone-100 p-2.5">
                                                            <div className="h-7 w-7 rounded-md bg-stone-100 flex items-center justify-center">
                                                                <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-stone-900">iPhone 15</p>
                                                                <p className="text-[10px] text-stone-500 truncate">Safari • San Francisco, CA</p>
                                                            </div>
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="mt-4 flex gap-2">
                                                    <button className="flex-1 rounded-lg bg-stone-900 py-2 text-xs font-medium text-white transition-all hover:bg-stone-800">
                                                        Manage Account
                                                    </button>
                                                    <button className="flex-1 rounded-lg border border-stone-200 bg-white py-2 text-xs font-medium text-stone-700 transition-all hover:bg-stone-50">
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button - Static visual */}
                                        <button
                                            disabled
                                            className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white transition-all duration-200"
                                            style={{
                                                opacity: authState === 'idle' ? 0.6 : authState === 'dashboard' ? 0 : 1,
                                                maxHeight: authState === 'dashboard' ? '0' : '44px',
                                                overflow: 'hidden',
                                                boxShadow: authState === 'submitting' 
                                                    ? '0 0 20px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                                                    : authState === 'success'
                                                        ? '0 0 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                                                        : 'inset 0 1px 0 rgba(255,255,255,0.15)',
                                                background: authState === 'success' 
                                                    ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                                                    : authState === 'submitting'
                                                        ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)'
                                                        : '#1c1917'
                                            }}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {authState === 'submitting' && (
                                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {authState === 'success' && (
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                )}
                                                {authState === 'submitting' ? 'Verifying...' : 
                                                 authState === 'verifying' ? 'Continue' :
                                                 authState === 'success' ? 'Signed in' : 'Continue'}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Security Tags */}
                                    <div className="mt-6 flex items-center justify-center gap-4">
                                        <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-400">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                            PKCE Flow
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-400">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                            </svg>
                                            RS256 Signed
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-400">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.356.108-.699.312-.997l9-13.5A.75.75 0 0112 4.5h.001Z" />
                                            </svg>
                                            Pairwise IDs
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Demo info footer */}
                            <div 
                                className="mt-4 text-center"
                                style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both" }}
                            >
                                <p className="text-xs text-stone-400">
                                    Simulated OAuth flow — real implementation is just 2 lines of code
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Features Section - Editorial Flow */}
                    <section id="features" className="relative px-6 py-24 sm:px-12 sm:py-32 lg:px-16">
                        <div className="mx-auto max-w-7xl">
                            {/* Section opener - tight, intentional */}
                            <div className="mb-20 sm:mb-28 lg:mb-36" style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 mb-4">Capabilities</p>
                                <h2 className="font-serif text-[clamp(40px,6vw,72px)] leading-[1.05] tracking-[-0.03em] text-stone-900 max-w-4xl">
                                    Everything you need, nothing you don&apos;t
                                </h2>
                            </div>

                            {/* Feature 1 - OAuth Provider */}
                            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 mb-24 sm:mb-32" style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}>
                                <div className="lg:col-span-5 lg:col-start-1">
                                    <div className="sticky top-32">
                                        <span className="text-sm font-medium text-blue-600 mb-3 block">01</span>
                                        <h3 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-4 leading-tight">
                                            OAuth Provider
                                        </h3>
                                        <p className="text-base leading-relaxed text-stone-500 max-w-md">
                                            Shoo is the auth provider. No need for Auth0, Clerk, or Google. Just point your redirect URI to shooauth.com and get verified user identities via JWT.
                                        </p>
                                    </div>
                                </div>
                                <div className="lg:col-span-6 lg:col-start-7">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 py-4 border-t border-stone-200">
                                            <svg className="h-5 w-5 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-stone-600">No signup or API keys required</span>
                                        </div>
                                        <div className="flex items-center gap-4 py-4 border-t border-stone-200">
                                            <svg className="h-5 w-5 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                            <span className="text-sm text-stone-600">PKCE flow with S256 challenge</span>
                                        </div>
                                        <div className="flex items-center gap-4 py-4 border-t border-b border-stone-200">
                                            <svg className="h-5 w-5 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-stone-600">30-day token expiration</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 & 3 - Side by side */}
                            <div className="grid sm:grid-cols-2 gap-12 lg:gap-24 mb-24 sm:mb-32">
                                <div style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both" }}>
                                    <span className="text-sm font-medium text-violet-600 mb-3 block">02</span>
                                    <h3 className="font-serif text-2xl text-stone-900 mb-3">
                                        Session Management
                                    </h3>
                                    <p className="text-sm leading-relaxed text-stone-500">
                                        Automatic token storage in localStorage with background session monitoring. Auto-refresh and multi-device session tracking built-in.
                                    </p>
                                </div>
                                <div style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}>
                                    <span className="text-sm font-medium text-amber-600 mb-3 block">03</span>
                                    <h3 className="font-serif text-2xl text-stone-900 mb-3">
                                        Pairwise IDs
                                    </h3>
                                    <p className="text-sm leading-relaxed text-stone-500">
                                        Privacy-preserving user identifiers. Each app gets a unique user ID so users can&apos;t be tracked across different applications.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 - JWT / JWKS - Wide, offset */}
                            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 mb-24 sm:mb-32" style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both" }}>
                                <div className="lg:col-span-4 lg:col-start-2">
                                    <span className="text-sm font-medium text-emerald-600 mb-3 block">04</span>
                                    <h3 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-4 leading-tight">
                                        JWT Verification
                                    </h3>
                                    <p className="text-base leading-relaxed text-stone-500">
                                        RS256-signed JWTs with JWKS endpoint. Verify tokens server-side with standard libraries like Jose.
                                    </p>
                                </div>
                                <div className="lg:col-span-5 lg:col-start-8 flex items-center">
                                    <div className="font-mono text-xs text-stone-400 bg-stone-100 px-4 py-3 rounded-lg">
                                        https://shooauth.com/.well-known/jwks.json
                                    </div>
                                </div>
                            </div>

                            {/* Feature 5 & 6 - Compact row */}
                            <div className="grid sm:grid-cols-3 gap-8 lg:gap-12 mb-20">
                                <div style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}>
                                    <span className="text-sm font-medium text-rose-600 mb-2 block">05</span>
                                    <h3 className="font-serif text-xl text-stone-900 mb-2">
                                        No Passwords
                                    </h3>
                                    <p className="text-sm leading-relaxed text-stone-500">
                                        Users authenticate via Shoo. No password hashes to store, no credential breaches.
                                    </p>
                                </div>
                                <div className="sm:col-span-2 sm:pl-12 sm:border-l border-stone-200" style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both" }}>
                                    <span className="text-sm font-medium text-stone-600 mb-2 block">06</span>
                                    <h3 className="font-serif text-xl text-stone-900 mb-2">
                                        Framework Agnostic
                                    </h3>
                                    <p className="text-sm leading-relaxed text-stone-500 max-w-md">
                                        Works with any framework. React SDK available, or use the CDN script with vanilla JS, Vue, Svelte, or anything else.
                                    </p>
                                </div>
                            </div>

                            {/* Closing statement */}
                            <div className="pt-16 border-t border-stone-200" style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both" }}>
                                <p className="text-sm text-stone-400">
                                    All features included. No complex setup required.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Tenant Dashboard Feature Section */}
                    <section className="relative px-4 py-20 sm:px-6 sm:py-28 bg-stone-50">
                        <div className="mx-auto max-w-5xl">
                            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 mb-4">
                                        New: Shoo for Developers
                                    </div>
                                    <h2 className="font-serif text-[32px] leading-[1.2] tracking-[-0.02em] text-stone-900 sm:text-[36px]">
                                        Add auth to your app in minutes
                                    </h2>
                                    <p className="mt-4 text-[16px] leading-relaxed text-stone-600">
                                        Launch your own hosted authentication service. Create apps, get API keys, and let users sign in with Shoo — complete with session management, device tracking, and billing.
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {isAuthenticated ? (
                                            <Button
                                                asChild
                                                variant="blue-cta"
                                                effect="expandIcon"
                                                icon={ArrowRight}
                                                iconPlacement="right"
                                                className="rounded-xl px-6 py-3 text-[14px] font-semibold"
                                            >
                                                <Link href="/admin">admin</Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => signIn({ requestPii: true })}
                                                variant="blue-cta"
                                                effect="expandIcon"
                                                icon={ArrowRight}
                                                iconPlacement="right"
                                                className="rounded-xl px-6 py-3 text-[14px] font-semibold"
                                            >
                                                Create Your First App
                                            </Button>
                                        )}
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="rounded-xl border-stone-300 px-6 py-3 text-[14px] font-medium"
                                        >
                                            <Link href="/pricing">View Pricing</Link>
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative rounded-2xl border border-stone-200 bg-white p-6 shadow-lg">
                                    <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-stone-900">Your Apps</span>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {[
                                            { name: "Acme App", users: 142, plan: "Pro" },
                                            { name: "Side Project", users: 23, plan: "Free" },
                                            { name: "Client Dashboard", users: 89, plan: "Pro" },
                                        ].map((app, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-stone-900">{app.name}</p>
                                                    <p className="text-xs text-stone-500">{app.users} users</p>
                                                </div>
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${app.plan === "Pro" ? "bg-blue-50 text-blue-600" : "bg-stone-200 text-stone-600"}`}>
                                                    {app.plan}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="relative px-4 py-20 sm:px-6 sm:py-28">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 
                                className="font-serif text-[clamp(32px,5vw,48px)] leading-[1.1] tracking-[-0.02em] text-stone-900"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                            >
                                Ready to simplify auth?
                            </h2>
                            <p 
                                className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-stone-500 sm:text-[18px]"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
                            >
                                Free, open-source OAuth provider. No credit card required.
                            </p>
                            <div 
                                className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}
                            >
                                {isAuthenticated ? (
                                    <Button
                                        asChild
                                        variant="blue-cta"
                                        effect="expandIcon"
                                        icon={ArrowRight}
                                        iconPlacement="right"
                                        className="rounded-2xl px-8 py-4 text-[16px] font-semibold"
                                    >
                                        <Link href="/admin">admin</Link>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => signIn({ requestPii: true })}
                                        variant="blue-cta"
                                        effect="expandIcon"
                                        icon={ArrowRight}
                                        iconPlacement="right"
                                        className="rounded-2xl px-8 py-4 text-[16px] font-semibold"
                                    >
                                        Get Started Free
                                    </Button>
                                )}
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11 rounded-2xl border-stone-200 px-8 text-[16px] font-medium"
                                >
                                    <a href="/docs">Documentation</a>
                                </Button>
                            </div>
                            <p 
                                className="mt-6 text-[13px] text-stone-400"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
                            >
                                Open source. Self-hostable. No vendor lock-in.
                            </p>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="relative px-4 py-12 sm:px-6 sm:py-16 border-t border-stone-200">
                        <div className="mx-auto max-w-3xl text-center">
                            <p 
                                className="text-[13px] text-stone-400"
                                style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                            >
                                Questions? Feedback?{" "}
                                <a 
                                    href="mailto:drewsepeczi@gmail.com"
                                    className="text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-900 hover:decoration-stone-500"
                                >
                                    drewsepeczi@gmail.com
                                </a>
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}