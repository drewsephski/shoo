// Tenant dashboard for managing ShooAuth service

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useShooAuth } from "../../lib/shoo-convex";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowRight,
    Shield,
    Key,
    Users,
    Activity,
    Settings,
    CreditCard,
    Plus,
    CheckCircle,
    ChevronRight,
    ExternalLink,
    RefreshCw,
    Code,
    Globe,
    Lock,
    Zap,
    CheckCircle2,
    X,
} from "lucide-react";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
};

const slideVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
};

export default function TenantDashboard() {
    const { identity } = useShooAuth();
    const userId = identity?.userId;
    const searchParams = useSearchParams();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get("success") === "true") {
            setShowSuccess(true);
            // Auto-hide after 5 seconds
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const tenants = useQuery(
        api.tenants.getUserTenants,
        userId ? { userId } : "skip"
    );

    const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-md"
                >
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 rounded-2xl bg-stone-100 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-stone-400" />
                        </div>
                    </div>
                    <h1 className="font-serif text-2xl text-stone-900 mb-3">Authentication Required</h1>
                    <p className="text-stone-500 mb-8">Please sign in to manage your apps.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:from-blue-400/90 hover:to-blue-600/90"
                    >
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (!tenants) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <RefreshCw className="h-6 w-6 animate-spin text-white" />
                        </div>
                    </div>
                    <p className="font-serif text-xl text-stone-800">Loading your apps...</p>
                    <p className="text-stone-500 text-sm mt-2">Fetching tenant data</p>
                </motion.div>
            </div>
        );
    }

    if (tenants.length === 0) {
        return <CreateTenantPrompt userId={userId} />;
    }

    return (
        <div className="min-h-screen bg-stone-100 pb-12">
            {/* Success Banner */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="flex items-center gap-3 rounded-xl bg-emerald-500 text-white px-5 py-3 shadow-lg shadow-emerald-500/25">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Payment successful! Your plan has been upgraded.</span>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="ml-2 hover:bg-emerald-600 rounded-lg p-1 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content - Navbar is already provided by layout */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                    {/* Header */}
                    <motion.section variants={itemVariants} className="border-b border-stone-200 pb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 mb-2">
                                    Developer Dashboard
                                </p>
                                <h1 className="font-serif text-[clamp(32px,5vw,48px)] leading-[1.1] tracking-[-0.02em] text-stone-900">
                                    Your Apps
                                </h1>
                                <p className="mt-2 text-stone-500 max-w-md">
                                    Manage authentication for your applications
                                </p>
                            </div>
                            <CreateTenantButton userId={userId} variant="header" />
                        </div>
                    </motion.section>

                    {/* App Grid Layout */}
                    <motion.section variants={itemVariants}>
                        <div className="grid gap-6 lg:grid-cols-12">
                            {/* Sidebar - App List */}
                            <div className="lg:col-span-4 xl:col-span-3">
                                <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
                                    <h2 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4 px-2">
                                        Applications
                                    </h2>
                                    <div className="space-y-1">
                                        {tenants.map((tenant) => (
                                            <button
                                                key={tenant._id}
                                                onClick={() => setSelectedTenant(tenant._id)}
                                                className={`w-full rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                                                    selectedTenant === tenant._id
                                                        ? "bg-blue-50 border border-blue-200 shadow-sm"
                                                        : "hover:bg-stone-50 border border-transparent"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                                        selectedTenant === tenant._id
                                                            ? "bg-blue-100 text-blue-600"
                                                            : "bg-stone-100 text-stone-500"
                                                    }`}>
                                                        <Code className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-medium truncate ${
                                                            selectedTenant === tenant._id ? "text-blue-900" : "text-stone-900"
                                                        }`}>
                                                            {tenant.name}
                                                        </div>
                                                        <div className="text-xs text-stone-500 flex items-center gap-2">
                                                            <span className="truncate">{tenant.slug}</span>
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                                tenant.plan === "free"
                                                                    ? "bg-stone-100 text-stone-600"
                                                                    : tenant.plan === "pro"
                                                                        ? "bg-blue-50 text-blue-600"
                                                                        : "bg-violet-50 text-violet-600"
                                                            }`}>
                                                                {tenant.plan === "free" ? "starter" : tenant.plan === "enterprise" ? "team" : tenant.plan}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <CreateTenantButton userId={userId} variant="sidebar" />
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="lg:col-span-8 xl:col-span-9">
                                <AnimatePresence mode="wait">
                                    {selectedTenant ? (
                                        <motion.div
                                            key={selectedTenant}
                                            variants={slideVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <TenantDetails tenantId={selectedTenant as Id<"tenants">} userId={userId} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="flex h-96 items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white"
                                        >
                                            <div className="text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="h-16 w-16 rounded-2xl bg-stone-50 flex items-center justify-center">
                                                        <Code className="h-8 w-8 text-stone-300" />
                                                    </div>
                                                </div>
                                                <p className="font-medium text-stone-900 mb-1">Select an app</p>
                                                <p className="text-sm text-stone-500">Choose an app from the sidebar to view details</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.section>
                </motion.div>
            </main>
        </div>
    );
}

function CreateTenantPrompt({ userId }: { userId: string }) {
    const [isCreating, setIsCreating] = useState(false);
    const createTenant = useMutation(api.tenants.createTenant);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            await createTenant({
                name: "My App",
                slug: `my-app-${Date.now()}`,
                ownerId: userId,
            });
        } catch (error) {
            console.error("Failed to create tenant:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-md"
            >
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
                        <Zap className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h1 className="font-serif text-3xl text-stone-900 mb-3">
                    Welcome to Shoo
                </h1>
                <p className="text-stone-500 mb-8 leading-relaxed">
                    Create your first app to start offering hosted authentication to your users. No API keys required to get started.
                </p>
                <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:from-blue-400/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreating ? (
                        <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            Create Your First App
                            <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>
                <p className="mt-6 text-xs text-stone-400">
                    Free plan includes 100 users and basic auth features
                </p>
            </motion.div>
        </div>
    );
}

function CreateTenantButton({ userId, variant = "sidebar" }: { userId: string; variant?: "sidebar" | "header" }) {
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const createTenant = useMutation(api.tenants.createTenant);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTenant({
                name,
                slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                ownerId: userId,
            });
            setShowModal(false);
            setName("");
            setSlug("");
        } catch (error) {
            console.error("Failed to create tenant:", error);
            alert("Failed to create tenant. Slug may be taken.");
        }
    };

    if (variant === "header") {
        return (
            <>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:from-blue-400/90 hover:to-blue-600/90 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    New App
                </button>
                {showModal && <CreateTenantModal {...{ showModal, setShowModal, name, setName, slug, setSlug, handleSubmit }} />}
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="mt-3 w-full rounded-xl border border-dashed border-stone-300 py-3 px-4 text-sm font-medium text-stone-500 transition-all duration-200 hover:border-stone-400 hover:text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2"
            >
                <Plus className="h-4 w-4" />
                Create New App
            </button>
            {showModal && <CreateTenantModal {...{ showModal, setShowModal, name, setName, slug, setSlug, handleSubmit }} />}
        </>
    );
}

function CreateTenantModal({
    setShowModal,
    name,
    setName,
    slug,
    setSlug,
    handleSubmit,
}: {
    setShowModal: (v: boolean) => void;
    name: string;
    setName: (v: string) => void;
    slug: string;
    setSlug: (v: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl text-stone-900">Create New App</h3>
                        <p className="text-sm text-stone-500">Set up a new authentication tenant</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-stone-700">
                            App Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="My Awesome App"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-stone-700">
                            Slug <span className="text-stone-400 font-normal">(unique identifier)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">shoo.dev/app/</span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) =>
                                    setSlug(
                                        e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9-]/g, "")
                                    )
                                }
                                className="w-full rounded-xl border border-stone-200 pl-[110px] pr-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="my-app"
                                required
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-stone-500">
                            Lowercase letters, numbers, and hyphens only
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-medium text-stone-700 transition-all hover:bg-stone-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:from-blue-400/90 hover:to-blue-600/90"
                        >
                            Create App
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function ApiKeyModal({
    isOpen,
    onClose,
    onConfirm,
    newApiKey,
    isRegenerating,
    tenantName,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    newApiKey: string | null;
    isRegenerating: boolean;
    tenantName: string;
}) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        if (newApiKey) {
            navigator.clipboard.writeText(newApiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-2xl shadow-stone-200/50"
            >
                {!newApiKey ? (
                    // Confirmation State
                    <>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
                                <Shield className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-serif text-xl font-medium text-stone-900">
                                    Regenerate API Key?
                                </h3>
                                <p className="text-sm text-stone-500">{tenantName}</p>
                            </div>
                        </div>

                        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                                    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-amber-900">Warning</p>
                                    <p className="text-sm text-amber-700/80">
                                        This will immediately invalidate your current API key. Any applications using the old key will stop working.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-medium text-stone-700 transition-all hover:bg-stone-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isRegenerating}
                                className="flex-1 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:from-rose-500/90 hover:to-rose-600/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRegenerating ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </span>
                                ) : (
                                    "Regenerate Key"
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    // Success State - Show New Key
                    <>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                                <Key className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-serif text-xl font-medium text-stone-900">
                                    API Key Generated
                                </h3>
                                <p className="text-sm text-stone-500">Copy this key now</p>
                            </div>
                        </div>

                        <div className="mb-6 space-y-4">
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-emerald-900">Success</p>
                                        <p className="text-sm text-emerald-700/80">
                                            Your old API key has been invalidated. Update your applications with the new key below.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* API Key Display */}
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-400">
                                    New API Key
                                </label>
                                <div className="relative">
                                    <code className="block rounded-xl bg-stone-900 px-4 py-4 text-sm font-mono text-stone-300 break-all pr-24">
                                        {newApiKey}
                                    </code>
                                    <button
                                        onClick={handleCopy}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-stone-800 px-3 py-2 text-xs font-medium text-stone-300 transition-all hover:bg-stone-700"
                                    >
                                        {copied ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-400">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Copied!
                                            </span>
                                        ) : (
                                            "Copy"
                                        )}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-stone-500">
                                    This key will only be shown once. Store it securely in your environment variables.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:from-blue-400/90 hover:to-blue-600/90"
                        >
                            Done
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
}

function TenantDetails({
    tenantId,
    userId,
}: {
    tenantId: Id<"tenants">;
    userId: string;
}) {
    const tenant = useQuery(
        api.tenants.getTenantForOwner,
        { tenantId, userId }
    );
    const stats = useQuery(
        api.tenants.getTenantStats,
        { tenantId, userId }
    );
    const planDetails = useQuery(
        api.billing.getPlanDetails,
        { tenantId, userId }
    );

    const [activeTab, setActiveTab] = useState<"overview" | "settings" | "billing">(
        "overview"
    );

    if (!tenant || !stats || !planDetails) {
        return (
            <div className="flex h-96 items-center justify-center rounded-3xl border border-stone-200 bg-white">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-white" />
                        </div>
                    </div>
                    <p className="text-stone-500">Loading app details...</p>
                </motion.div>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: "Overview", icon: Activity },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "billing", label: "Billing", icon: CreditCard },
    ] as const;

    return (
        <div className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            {/* Header with App Info */}
            <div className="border-b border-stone-200 bg-stone-50/50 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Code className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-2xl text-stone-900">{tenant.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-stone-500">{tenant.slug}</span>
                                <span className="text-stone-300">·</span>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    tenant.plan === "free"
                                        ? "bg-stone-100 text-stone-600"
                                        : tenant.plan === "pro"
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-violet-50 text-violet-600"
                                }`}>
                                    {tenant.plan === "free" ? "starter" : tenant.plan === "enterprise" ? "team" : tenant.plan}
                                </span>
                            </div>
                        </div>
                    </div>
                    <a
                        href={`https://shooauth.com/${tenant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition-all hover:bg-stone-50 hover:border-stone-300"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View Public Page
                    </a>
                </div>
            </div>

            {/* Modern Tab Navigation */}
            <div className="border-b border-stone-200 px-6">
                <div className="flex gap-1 -mb-px">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all ${
                                    isActive
                                        ? "text-blue-600"
                                        : "text-stone-500 hover:text-stone-700"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "overview" && (
                            <OverviewTab tenant={tenant} stats={stats} planDetails={planDetails} />
                        )}
                        {activeTab === "settings" && <SettingsTab tenant={tenant} userId={userId} />}
                        {activeTab === "billing" && (
                            <BillingTab tenant={tenant} planDetails={planDetails} userId={userId} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function OverviewTab({
    tenant,
    stats,
    planDetails,
}: {
    tenant: any;
    stats: any;
    planDetails: any;
}) {
    const [copiedKey, setCopiedKey] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total Users"
                    value={stats.userCount}
                    max={planDetails.limits.maxUsers}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    label="Active Sessions"
                    value={stats.sessionCount}
                    max={planDetails.limits.maxSessionsPerUser * stats.userCount}
                    icon={Activity}
                    color="violet"
                />
                <StatCard
                    label="Current Plan"
                    value={tenant.plan.toUpperCase()}
                    icon={Shield}
                    color="emerald"
                />
            </div>

            {/* API Credentials */}
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
                <div className="border-b border-stone-200 bg-stone-50/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
                            <Key className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-stone-900">API Credentials</h3>
                            <p className="text-sm text-stone-500">Use these to integrate with your app</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    {/* Public Key */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                            <Globe className="h-4 w-4 text-stone-400" />
                            Public Key
                            <span className="text-xs font-normal text-stone-400">(safe to expose in client-side code)</span>
                        </label>
                        <div className="relative">
                            <code className="block rounded-xl bg-stone-900 px-4 py-3 text-sm font-mono text-stone-300 break-all">
                                {tenant.publicKey}
                            </code>
                            <button
                                onClick={() => handleCopy(tenant.publicKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-stone-300 transition-colors hover:bg-stone-700"
                            >
                                {copiedKey ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                            <Lock className="h-4 w-4 text-stone-400" />
                            API Key
                            <span className="text-xs font-normal text-rose-500">(keep secret)</span>
                        </label>
                        <div className="relative">
                            <code className="block rounded-xl bg-stone-900 px-4 py-3 text-sm font-mono text-stone-300">
                                {tenant.apiKey.slice(0, 20)}...
                            </code>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 bg-stone-800 px-2 py-1 rounded">
                                    Secret
                                </span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-stone-500">
                            This key grants full access to your tenant. Store it securely and never expose it in client-side code.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Integration Guide */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
                <h4 className="font-medium text-stone-900 mb-3">Quick Start</h4>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-blue-600">1</span>
                        </div>
                        <p className="text-sm text-stone-600">
                            Add the Shoo script to your HTML:{" "}
                            <code className="text-xs bg-white px-1.5 py-0.5 rounded border">{`<script src="https://shoo.dev/v1/shoo.js"></script>`}</code>
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-blue-600">2</span>
                        </div>
                        <p className="text-sm text-stone-600">
                            Initialize with your public key:{" "}
                            <code className="text-xs bg-white px-1.5 py-0.5 rounded border">
                                {`Shoo.init("${tenant.publicKey.slice(0, 16)}...")`}
                            </code>
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-blue-600">3</span>
                        </div>
                        <p className="text-sm text-stone-600">
                            Add a sign-in link:{" "}
                            <code className="text-xs bg-white px-1.5 py-0.5 rounded border">{`<a href="/auth/signin">Sign In</a>`}</code>
                        </p>
                    </div>
                </div>
                <a
                    href="/docs"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View full documentation
                    <ChevronRight className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    max,
    icon: Icon,
    color = "blue",
}: {
    label: string;
    value: number | string;
    max?: number;
    icon: React.ElementType;
    color?: "blue" | "violet" | "emerald" | "amber";
}) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        violet: "bg-violet-50 text-violet-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-stone-500">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl text-stone-900">{value}</span>
                {max && max > 0 && (
                    <span className="text-sm text-stone-400">
                        / {max}
                    </span>
                )}
            </div>
        </div>
    );
}

function SettingsTab({ tenant, userId }: { tenant: any; userId: string }) {
    const updateTenant = useMutation(api.tenants.updateTenant);
    const regenerateApiKey = useMutation(api.tenants.regenerateApiKey);

    const [name, setName] = useState(tenant.name);
    const [origins, setOrigins] = useState(tenant.allowedOrigins.join(", "));
    const [isSaving, setIsSaving] = useState(false);
    
    // API Key Modal state
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [newApiKey, setNewApiKey] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateTenant({
                tenantId: tenant._id,
                userId,
                updates: {
                    name,
                    allowedOrigins: origins.split(",").map((o) => o.trim()).filter(Boolean),
                },
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerateKey = async () => {
        setShowApiKeyModal(true);
    };

    const confirmRegenerate = async () => {
        setIsRegenerating(true);
        try {
            const result = await regenerateApiKey({
                tenantId: tenant._id,
                userId,
            });
            setNewApiKey(result.apiKey);
        } catch (error) {
            console.error("Failed to regenerate API key:", error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const closeModal = () => {
        setShowApiKeyModal(false);
        setNewApiKey(null);
        setIsRegenerating(false);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* App Name */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Code className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-stone-900">App Name</h3>
                        <p className="text-sm text-stone-500">The display name for your application</p>
                    </div>
                </div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="My Awesome App"
                />
            </div>

            {/* Allowed Origins */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-stone-900">Allowed Origins (CORS)</h3>
                        <p className="text-sm text-stone-500">Domains allowed to use your Shoo integration</p>
                    </div>
                </div>
                <textarea
                    value={origins}
                    onChange={(e) => setOrigins(e.target.value)}
                    placeholder="https://example.com, https://app.example.com"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    rows={3}
                />
                <p className="mt-2 text-xs text-stone-500">
                    Comma-separated list of allowed origins. Use * for development only.
                </p>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
                        <Key className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-rose-900">API Key</h3>
                        <p className="text-sm text-rose-600">Regenerate if your key has been compromised</p>
                    </div>
                </div>
                <button
                    onClick={handleRegenerateKey}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-medium text-rose-700 transition-all hover:bg-rose-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate API Key
                </button>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:from-blue-400/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>

            {/* API Key Modal */}
            <ApiKeyModal
                isOpen={showApiKeyModal}
                onClose={closeModal}
                onConfirm={confirmRegenerate}
                newApiKey={newApiKey}
                isRegenerating={isRegenerating}
                tenantName={tenant.name}
            />
        </div>
    );
}

function BillingTab({
    tenant,
    planDetails,
    userId,
}: {
    tenant: any;
    planDetails: any;
    userId: string;
}) {
    const createCheckout = useMutation(api.billing.createCheckoutSession);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleUpgrade = async (plan: "pro" | "team") => {
        setIsLoading(plan);
        try {
            const result = await createCheckout({
                tenantId: tenant._id,
                userId,
                plan,
                successUrl: `${window.location.origin}/dashboard?success=true`,
                cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
            });

            if (result.priceId) {
                const stripe = await import("@stripe/stripe-js").then((m) =>
                    m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")
                );

                if (!stripe) {
                    alert("Stripe not configured");
                    return;
                }

                const response = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        priceId: result.priceId,
                        tenantId: tenant._id,
                        customerEmail: undefined,
                        successUrl: result.successUrl,
                        cancelUrl: result.cancelUrl,
                    }),
                });

                const { sessionId, url, error } = await response.json();

                if (error) throw new Error(error);

                // Redirect to Stripe Checkout using the session URL
                if (url) {
                    window.location.href = url;
                } else {
                    throw new Error("No checkout URL returned");
                }
            }
        } catch (err) {
            console.error("Checkout failed:", err);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setIsLoading(null);
        }
    };

    const plans = [
        {
            id: "free",
            name: "Starter",
            price: 0,
            priceLabel: "Free",
            description: "Self-hosted, full source code",
            features: [
                "Full production template",
                "OAuth + session management",
                "Rate limiting & audit logs",
                "Device fingerprinting",
                "Admin dashboard",
                "Community Discord",
            ],
            color: "stone",
        },
        {
            id: "pro",
            name: "Pro",
            price: 79,
            priceLabel: "$79 one-time",
            description: "Template + 1 year updates",
            features: [
                "Everything in Starter",
                "1 year of updates",
                "Priority Discord support",
                "Video setup guide",
            ],
            color: "blue",
            popular: true,
        },
        {
            id: "team",
            name: "Team",
            price: 299,
            priceLabel: "$299 one-time",
            description: "Full package + implementation help",
            features: [
                "Everything in Pro",
                "Lifetime updates",
                "1:1 code review call (30 min)",
                "Email support (30 days)",
                "Custom guidance",
            ],
            color: "violet",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Current Plan Banner */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-stone-500">Current Plan</p>
                            <h3 className="font-serif text-xl text-stone-900">
                                {planDetails.plan.charAt(0).toUpperCase() + planDetails.plan.slice(1)}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {tenant.stripeSubscriptionId && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                </span>
                                Active
                            </span>
                        )}
                        {planDetails.priceLabel && (
                            <span className="text-lg font-medium text-stone-900">
                                {planDetails.priceLabel}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Plan Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                {plans.map((plan) => {
                    const isCurrent = planDetails.plan === plan.id;
                    const isLoadingState = isLoading === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl border p-6 transition-all ${
                                isCurrent
                                    ? "border-blue-500 bg-blue-50/30 shadow-md"
                                    : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                            }`}
                        >
                            {plan.popular && !isCurrent && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                                        <Zap className="h-3 w-3" />
                                        Popular
                                    </span>
                                </div>
                            )}
                            {isCurrent && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                                        Current Plan
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h4 className="font-serif text-xl text-stone-900 mb-1">{plan.name}</h4>
                                <p className="text-sm text-stone-500 mb-3">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="font-serif text-3xl text-stone-900">{plan.priceLabel}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-stone-600">
                                        <CheckCircle className={`h-4 w-4 flex-shrink-0 ${
                                            isCurrent ? "text-blue-600" : "text-stone-400"
                                        }`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {!isCurrent && plan.id !== "free" && (
                                <button
                                    onClick={() => handleUpgrade(plan.id as "pro" | "team")}
                                    disabled={isLoadingState}
                                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                                        plan.id === "pro" || plan.id === "team"
                                            ? "bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:from-blue-400/90 hover:to-blue-600/90"
                                            : "border border-stone-300 text-stone-700 hover:bg-stone-50"
                                    }`}
                                >
                                    {isLoadingState ? (
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Loading...
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center gap-2">
                                            Upgrade to {plan.name}
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    )}
                                </button>
                            )}

                            {isCurrent && (
                                <button
                                    disabled
                                    className="w-full rounded-xl border border-blue-300 bg-blue-100 py-3 text-sm font-semibold text-blue-700 cursor-default"
                                >
                                    Current Plan
                                </button>
                            )}

                            {!isCurrent && plan.id === "free" && (
                                <button
                                    disabled
                                    className="w-full rounded-xl border border-stone-200 bg-stone-100 py-3 text-sm font-semibold text-stone-500 cursor-default"
                                >
                                    Included
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Plan Features Detail */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
                <h4 className="font-medium text-stone-900 mb-4">Your Current Features</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                    {planDetails.features.map((feature: string) => (
                        <div key={feature} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="text-sm text-stone-700">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
