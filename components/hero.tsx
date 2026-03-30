"use client";

import { useState, useEffect } from "react";
import { useShooAuth } from "@/lib/shoo-convex";
import Head from "next/head";
import { motion } from "framer-motion";

type AuthState = "idle" | "typing" | "submitting" | "verifying" | "success" | "dashboard";

export default function Hero() {
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [activeStep, setActiveStep] = useState(0);
  const { signIn } = useShooAuth();

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
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-4 py-1.5 text-[13px] text-stone-600 shadow-sm backdrop-blur-sm"
                            style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            Version 1.1 — Now available
                        </div>

                        <h1
                            className="relative z-10 max-w-4xl text-center text-[#1C1917]"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
                        >
                            <span className="block font-serif text-[clamp(48px,8vw,88px)] leading-[1.05] tracking-[-0.02em]">Secure sign‑in.</span>
                            <span className="block font-serif text-[clamp(48px,8vw,88px)] leading-[1.05] tracking-[-0.02em] text-stone-400">Fast and flexible.</span>
                        </h1>
                        <p
                            className="relative z-10 mt-4 max-w-xl px-4 text-center text-[15px] leading-relaxed text-stone-600 sm:mt-6 sm:text-[18px]"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both" }}
                        >
                            Shoo is a modern authentication platform that lets you add secure sign‑in, session management, and user identities to your app in minutes
                        </p>
                        <div
                            className="relative z-20 mt-8 flex flex-col items-center"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both" }}
                        >
                            <button
                                onClick={() => signIn({ requestPii: true })}
                                className="flex items-center gap-2.5 rounded-2xl px-8 py-4 text-[16px] font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
                                style={{
                                    background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
                                    boxShadow: "0 1px 0 #1d4ed8, 0 4px 8px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                                }}
                            >
                                Get Started
                            </button>
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
                                        Secure authentication
                                    </h3>
                                    <p className="mt-2 text-sm text-stone-500">
                                        See how Shoo handles sign-in, 2FA, and session management
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
                                                {authState === 'idle' && 'Waiting to start...'}
                                                {authState === 'typing' && 'Entering credentials...'}
                                                {authState === 'submitting' && 'Verifying credentials...'}
                                                {authState === 'verifying' && '2FA verification required'}
                                                {authState === 'success' && 'Authentication successful'}
                                                {authState === 'dashboard' && 'Dashboard active'}
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
                                                        <p className="text-sm font-medium text-stone-900">Sarah Evans</p>
                                                        <p className="text-xs text-stone-500">Session active · 3 devices</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button - Static visual */}
                                        <button
                                            disabled
                                            className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white transition-all duration-200"
                                            style={{
                                                opacity: authState === 'idle' ? 0.6 : 1,
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
                                            Encrypted
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-400">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                            </svg>
                                            Verified
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-400">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.356.108-.699.312-.997l9-13.5A.75.75 0 0112 4.5h.001Z" />
                                            </svg>
                                            2FA Active
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
                                    This demo loops automatically to show the full authentication flow
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Features Section - Refined Grid */}
                    <section className="relative px-4 py-20 sm:px-6 sm:py-28">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
                        </div>

                        {/* Section Header */}
                        <div className="mx-auto max-w-2xl text-center mb-16 sm:mb-20">
                            <h2 
                                className="font-serif text-[clamp(32px,5vw,48px)] leading-[1.1] tracking-[-0.02em] text-stone-900"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                            >
                                Everything you need
                            </h2>
                            <p 
                                className="mt-4 text-[16px] leading-relaxed text-stone-500 sm:text-[18px]"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
                            >
                                Built-in authentication flows that just work—no complex setup, no maintenance headaches
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="mx-auto max-w-6xl">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Feature 1 - Magic Links */}
                                <div 
                                    className="group relative rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50"
                                    style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both" }}
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-stone-900">Magic Links</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
                                        Passwordless sign-in with secure email links. No passwords to forget or compromise.
                                    </p>
                                </div>

                                {/* Feature 2 - OAuth */}
                                <div 
                                    className="group relative rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50"
                                    style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v.003A9.338 9.338 0 016.678 15m9.441-4.81a4.125 4.125 0 00-7.533 2.493M15 10.19v.003a9.338 9.338 0 01-9.441 4.81m9.441-4.81a9.338 9.338 0 00-9.441-4.81m0 0a9.338 9.338 0 00-4.121.952M6.678 15A9.338 9.338 0 0115 10.19m0 0v-.003" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-stone-900">OAuth Providers</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
                                        One-click sign-in with Google, GitHub, and more. Your users already have accounts.
                                    </p>
                                </div>

                                {/* Feature 3 - Sessions */}
                                <div 
                                    className="group relative rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50"
                                    style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both" }}
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.356.108-.699.312-.997l9-13.5A.75.75 0 0112 4.5h.001Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-stone-900">Session Management</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
                                        Automatic session handling with secure tokens, refresh logic, and device tracking.
                                    </p>
                                </div>

                                {/* Feature 4 - 2FA */}
                                <div 
                                    className="group relative rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50"
                                    style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.052 3.893 10.151 9 11.251 5.107-1.1 9-6.2 9-11.25 0-2.245-.532-4.346-1.596-6.104M15 2.25a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-stone-900">Two-Factor Auth</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
                                        Built-in TOTP and SMS 2FA support. Add an extra layer of security in one line.
                                    </p>
                                </div>

                                {/* Feature 5 - User Management */}
                                <div 
                                    className="group relative rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50"
                                    style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both" }}
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v.003A9.338 9.338 0 016.678 15m0 0a9.338 9.338 0 019.441-4.81m-9.441 4.81a9.338 9.338 0 019.441-4.81M6.678 15a9.338 9.338 0 019.441-4.81M15 10.19v.003a9.338 9.338 0 01-9.441 4.81m9.441-4.81a9.338 9.338 0 00-9.441-4.81M6.678 15a9.338 9.338 0 01-2.184-.503 3.375 3.375 0 01-1.612-1.612C2.878 12.266 2.878 11.734 2.878 11.734s0-.532.586-1.151a3.375 3.375 0 011.612-1.612c.618-.586 1.151-.586 1.151-.586" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-stone-900">User Management</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
                                        Complete user profiles, metadata, and admin controls. Know your users.
                                    </p>
                                </div>

                                {/* Feature 6 - Convex Native */}
                                <div 
                                    className="group relative rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50"
                                    style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both" }}
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-stone-900">Convex Native</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
                                        Deep integration with Convex. Real-time auth state, automatic sync, type-safe APIs.
                                    </p>
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
                                Join thousands of developers who ship faster with Shoo Auth
                            </p>
                            <div 
                                className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}
                            >
                                <button
                                    onClick={() => signIn({ requestPii: true })}
                                    className="flex items-center gap-2.5 rounded-2xl px-8 py-4 text-[16px] font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
                                    style={{
                                        background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
                                        boxShadow: "0 1px 0 #1d4ed8, 0 4px 8px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                                    }}
                                >
                                    Get Started Free
                                </button>
                                <a 
                                    href="/docs" 
                                    className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-8 py-4 text-[16px] font-medium text-stone-700 transition-all duration-200 hover:border-stone-300 hover:bg-stone-50"
                                >
                                    Read Documentation
                                </a>
                            </div>
                            <p 
                                className="mt-6 text-[13px] text-stone-400"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
                            >
                                Free for personal projects. No credit card required.
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}