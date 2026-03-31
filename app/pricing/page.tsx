"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
    {
        q: "What counts as an active user?",
        a: "An active user is anyone who signs in at least once during your billing cycle. We don't count users who haven't signed in.",
    },
    {
        q: "Can I change plans at any time?",
        a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate any difference.",
    },
    {
        q: "Is there a free trial?",
        a: "Yes, all paid plans include a 14-day free trial with full access to all features. No credit card required.",
    },
    {
        q: "What happens if I exceed my user limit?",
        a: "We'll notify you when you reach 80% of your limit. You can upgrade anytime, or we'll automatically move you to the next tier.",
    },
];

function FaqAccordion() {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const cardVariants = {
        collapsed: {
            height: "60px",
            transition: { type: "spring" as const, stiffness: 300, damping: 15 },
        },
        expanded: {
            height: "auto",
            transition: { type: "spring" as const, stiffness: 300, damping: 15 },
        },
    };

    const contentVariants = {
        collapsed: { opacity: 0 },
        expanded: {
            opacity: 1,
            transition: { delay: 0.1 },
        },
    };

    const chevronVariants = {
        collapsed: { rotate: 0 },
        expanded: { rotate: 180 },
    };

    return (
        <div className="space-y-3">
            {faqData.map((faq, index) => (
                <motion.div
                    key={index}
                    className="cursor-pointer select-none overflow-hidden rounded-xl border border-stone-200 bg-white"
                    variants={cardVariants}
                    initial="collapsed"
                    animate={expandedIndex === index ? "expanded" : "collapsed"}
                    onClick={() => handleToggle(index)}
                >
                    <div className="flex h-[60px] items-center justify-between px-5">
                        <h3 className="m-0 pr-4 text-sm font-semibold text-stone-900">
                            {faq.q}
                        </h3>
                        <motion.div variants={chevronVariants}>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-stone-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </motion.div>
                    </div>
                    <motion.div
                        className="select-none px-5 pb-5"
                        variants={contentVariants}
                        initial="collapsed"
                        animate={expandedIndex === index ? "expanded" : "collapsed"}
                    >
                        <p className="m-0 text-sm leading-relaxed text-stone-600">
                            {faq.a}
                        </p>
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
}

function AnimatedPrice({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(value);
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (value === displayValue) return;
        
        const start = displayValue;
        const end = value;
        const step = end > start ? 1 : -1;
        const duration = 400;
        const totalSteps = Math.abs(end - start);
        const stepTime = duration / totalSteps;
        
        let current = start;
        const timer = setInterval(() => {
            current += step;
            setDisplayValue(current);
            if (current === end) clearInterval(timer);
        }, stepTime);
        
        return () => clearInterval(timer);
    }, [value, displayValue]);

    return (
        <span className="relative inline-block overflow-hidden h-[48px] w-[60px] align-bottom">
            <span 
                ref={containerRef}
                className="absolute inset-0 flex items-center justify-center font-serif text-4xl font-medium text-stone-900 transition-transform duration-150"
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
                ${displayValue}
            </span>
        </span>
    );
}

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    const features = {
        starter: [
            "1,000 active users",
            "Email/password auth",
            "Session management",
            "Basic analytics",
            "Community support",
        ],
        pro: [
            "10,000 active users",
            "OAuth providers (Google, GitHub)",
            "2FA / TOTP",
            "Custom branding",
            "Priority support",
            "Advanced analytics",
        ],
        enterprise: [
            "Unlimited users",
            "SAML / SSO",
            "Custom integrations",
            "SLA guarantee",
            "Dedicated support",
            "Audit logs",
            "On-premise option",
        ],
    };

    return (
        <>
            <Head>
                <title>Pricing — Shoo Auth</title>
                <meta name="description" content="Simple, transparent pricing for Shoo Auth" />
            </Head>

            <style jsx global>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .font-serif {
                    font-family: "Instrument Serif", Georgia, serif;
                }
            `}</style>

            <div className="min-h-screen bg-stone-100 text-stone-900 antialiased">
                <main className="pt-20">
                    {/* Hero Section */}
                    <section className="relative flex flex-col items-center justify-center px-4 pb-4 pt-8">
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-4 py-1.5 text-[13px] text-stone-600 shadow-sm backdrop-blur-sm"
                            style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            No credit card required
                        </div>

                        <h1
                            className="relative z-10 max-w-4xl text-center text-[#1C1917]"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
                        >
                            <span className="block font-serif text-[clamp(40px,7vw,72px)] leading-[1.05] tracking-[-0.02em]">Simple pricing.</span>
                            <span className="block font-serif text-[clamp(40px,7vw,72px)] leading-[1.05] tracking-[-0.02em] text-stone-400">No surprises.</span>
                        </h1>
                        <p
                            className="relative z-10 mt-4 max-w-xl px-4 text-center text-[15px] leading-relaxed text-stone-600 sm:mt-6 sm:text-[18px]"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both" }}
                        >
                            Start free and scale as you grow. All plans include core authentication features with no hidden fees.
                        </p>

                        {/* Billing Toggle */}
                        <div
                            className="relative z-20 mt-8 flex items-center gap-3 rounded-full border border-stone-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm"
                            style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both" }}
                        >
                            <button
                                onClick={() => setBillingCycle("monthly")}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    billingCycle === "monthly"
                                        ? "bg-stone-900 text-white"
                                        : "text-stone-600 hover:text-stone-900"
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle("yearly")}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    billingCycle === "yearly"
                                        ? "bg-stone-900 text-white"
                                        : "text-stone-600 hover:text-stone-900"
                                }`}
                            >
                                Yearly
                                <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">
                                    -20%
                                </span>
                            </button>
                        </div>
                    </section>

                    {/* Pricing Cards */}
                    <section className="relative px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-12">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(120,113,108,0.03),transparent_50%)]"></div>
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
                        </div>

                        <div
                            className="relative mx-auto max-w-6xl"
                            style={{ animation: "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both" }}
                        >
                            <div className="grid gap-6 md:grid-cols-3">
                                {/* Starter Plan */}
                                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                                    <div className="mb-4">
                                        <h3 className="font-serif text-xl font-medium text-stone-900">Starter</h3>
                                        <p className="mt-1 text-sm text-stone-500">Perfect for side projects</p>
                                    </div>
                                    <div className="mb-6">
                                        <span className="font-serif text-4xl font-medium text-stone-900">$0</span>
                                        <span className="text-stone-500">/month</span>
                                    </div>
                                    <ul className="mb-6 space-y-3">
                                        {features.starter.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                <span className="text-sm text-stone-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="w-full rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-900 transition-all hover:bg-stone-200"
                                    >
                                        Get Started Free
                                    </button>
                                </div>

                                {/* Pro Plan */}
                                <div className="relative rounded-2xl border-2 border-blue-500 bg-white p-6 shadow-lg shadow-blue-500/10">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white">
                                            Most Popular
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="font-serif text-xl font-medium text-stone-900">Pro</h3>
                                        <p className="mt-1 text-sm text-stone-500">For growing apps</p>
                                    </div>
                                    <div className="mb-6">
                                        <span className="font-serif text-4xl font-medium text-stone-900">
                                            <AnimatedPrice value={billingCycle === "monthly" ? 29 : 23} />
                                        </span>
                                        <span className="text-stone-500">/month</span>
                                    </div>
                                    <ul className="mb-6 space-y-3">
                                        {features.pro.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                <span className="text-sm text-stone-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="w-full rounded-xl py-3 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
                                        style={{
                                            background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
                                            boxShadow: "0 1px 0 #1d4ed8, 0 4px 8px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                                        }}
                                    >
                                        Start 14-day Trial
                                    </button>
                                </div>

                                {/* Enterprise Plan */}
                                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                                    <div className="mb-4">
                                        <h3 className="font-serif text-xl font-medium text-stone-900">Enterprise</h3>
                                        <p className="mt-1 text-sm text-stone-500">For large organizations</p>
                                    </div>
                                    <div className="mb-6">
                                        <span className="font-serif text-4xl font-medium text-stone-900">Custom</span>
                                    </div>
                                    <ul className="mb-6 space-y-3">
                                        {features.enterprise.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                <span className="text-sm text-stone-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="w-full rounded-xl bg-stone-900 py-3 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
                                    >
                                        Contact Sales
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="relative px-4 pb-20 sm:px-6">
                        <div
                            className="relative mx-auto max-w-3xl"
                            style={{ animation: "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both" }}
                        >
                            <div className="mb-12 text-center">
                                <h2 className="font-serif text-3xl font-medium text-stone-900">Frequently asked questions</h2>
                            </div>

                            <FaqAccordion />
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-stone-200 bg-white/50 px-4 py-12 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 500 503.44"
                                    fill="currentColor"
                                    className="size-5 text-blue-600"
                                >
                                    <path d="M499.33,335.68l-16.99-183.6c-6.92-74.84-66.99-133.68-141.95-139.06L164.61.4C75.67-5.98,0,64.45,0,153.61v196.22c0,84.83,68.77,153.61,153.61,153.61h192.78c90.42,0,161.28-77.72,152.95-167.76ZM312.47,30.89l158.32,158.32-14.14,14.14L298.33,45.04l14.14-14.14ZM183.9,475.98L26.48,318.56l43.59-43.59,157.41,157.41-43.59,43.59ZM289.33,471.74L29.32,211.73l37.96-37.96,260.01,260.01-37.96,37.96ZM365.24,437.98L63.07,135.81l31.73-31.73,302.18,302.18-31.73,31.73ZM420.08,383.15L117.9,80.97l25.31-25.31,302.18,302.18-25.31,25.31ZM453.83,307.23L193.75,47.15l19.68-19.68,260.08,260.08-19.68,19.68Z" />
                                </svg>
                                <span className="font-serif text-lg">Shoo</span>
                            </div>
                            <p className="text-sm text-stone-500">
                                © 2025 Shoo Auth. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
