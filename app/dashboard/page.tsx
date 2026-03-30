"use client";

import { useShooAuth } from "@/lib/shoo-convex";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Dashboard() {
    const { identity, claims, loading, sessionState } = useShooAuth();
    const router = useRouter();
    const [hasWaited, setHasWaited] = useState(false);

    // Fetch user from Convex (persisted user data)
    const convexUser = useQuery(
        api.users.getCurrentUser,
        identity.userId ? { userId: identity.userId } : "skip"
    );

    // Give a grace period for auth state to settle before redirecting
    useEffect(() => {
        const timer = setTimeout(() => setHasWaited(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Debug logging
    useEffect(() => {
        console.log("Dashboard auth state:", { loading, sessionState, hasUserId: !!identity.userId });
    }, [loading, sessionState, identity.userId]);

    // Only redirect when session is explicitly login_required
    useEffect(() => {
        if (hasWaited && !loading && sessionState === "login_required") {
            console.log("Redirecting - login required");
            router.push("/");
        }
    }, [sessionState, loading, hasWaited, router]);

    if (loading || !hasWaited) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                    <p className="font-serif text-lg text-stone-800">Loading your dashboard...</p>
                    <p className="text-stone-500 text-sm mt-2">Please wait a moment</p>
                </div>
            </div>
        );
    }

    if (!identity.userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center max-w-md px-4">
                    <div className="flex justify-center mb-6">
                        <div className="h-10 w-10 rounded-xl bg-stone-200 flex items-center justify-center">
                            <svg className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                    </div>
                    <p className="font-serif text-lg text-stone-800 mb-6">Not authenticated</p>
                    <button
                        onClick={() => router.push("/")}
                        className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                            background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
                        }}
                    >
                        Go home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 pt-20">
            {/* Main content */}
            <main className="mx-auto max-w-5xl px-4 py-12">
                <h1 className="font-serif text-3xl font-medium text-stone-900 mb-8">
                    Your Dashboard
                </h1>

                {/* User info cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Identity card */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400 mb-4">
                            Shoo Identity
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-stone-500">User ID</label>
                                <p className="text-sm font-mono text-stone-900 break-all">
                                    {identity.userId}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-stone-500">Session Active</label>
                                <p className="text-sm text-stone-900">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                        Yes — persisted via localStorage
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Convex User card */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400 mb-4">
                            Convex Database
                        </h2>
                        <div className="space-y-3">
                            {convexUser ? (
                                <>
                                    <div>
                                        <label className="text-xs text-stone-500">Stored Name</label>
                                        <p className="text-sm text-stone-900">{convexUser.name || "—"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-stone-500">Stored Email</label>
                                        <p className="text-sm text-stone-900">{convexUser.email || "—"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-stone-500">First Seen</label>
                                        <p className="text-sm text-stone-500">
                                            {new Date(convexUser.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-stone-500">Last Seen</label>
                                        <p className="text-sm text-stone-500">
                                            {new Date(convexUser.lastSeenAt).toLocaleString()}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-stone-400 italic">Loading from Convex…</p>
                            )}
                        </div>
                    </div>

                    {/* Claims card */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400 mb-4">
                            Profile Claims (JWT)
                        </h2>
                        <div className="space-y-3">
                            {claims?.name ? (
                                <div>
                                    <label className="text-xs text-stone-500">Name</label>
                                    <p className="text-sm text-stone-900">{claims.name}</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs text-stone-500">Name</label>
                                    <p className="text-sm text-stone-400 italic">Not provided</p>
                                </div>
                            )}
                            {claims?.email ? (
                                <div>
                                    <label className="text-xs text-stone-500">Email</label>
                                    <p className="text-sm text-stone-900">{claims.email}</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs text-stone-500">Email</label>
                                    <p className="text-sm text-stone-400 italic">Not provided</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Raw token card */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400 mb-4">
                            Token (ID Token)
                        </h2>
                        <p className="text-xs text-stone-500 mb-2">
                            This is your JWT — it&apos;s automatically persisted and refreshed
                        </p>
                        <code className="block rounded-lg bg-stone-100 p-4 text-xs font-mono text-stone-700 break-all">
                            {identity.token?.slice(0, 100)}…
                        </code>
                    </div>
                </div>

                {/* Session info */}
                <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
                    <h2 className="text-sm font-medium text-blue-900 mb-2">
                        Session & Data Persistence
                    </h2>
                    <p className="text-sm text-blue-700">
                        Your session is stored in localStorage and your user data is persisted in Convex.
                        Both survive browser restarts. The hook automatically handles token refresh and
                        session monitoring every 60 seconds.
                    </p>
                </div>
            </main>
        </div>
    );
}
