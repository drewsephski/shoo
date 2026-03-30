"use client";

import { useShooAuth } from "@/lib/shoo-convex";
import { useRouter } from "next/navigation";

export function Profile() {
    const router = useRouter();
    const { identity, claims, loading, signIn, clearIdentity } = useShooAuth();

    const handleSignOut = () => {
        clearIdentity();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-stone-500">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Loading…</span>
            </div>
        );
    }

    if (!identity.userId) {
        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={() => signIn({ requestPii: true })}
                    className="rounded-full px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{
                        background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
                        boxShadow: "0 1px 0 #1d4ed8, 0 2px 4px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    }}
                >
                    Sign in
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 rounded-full border border-stone-200 bg-white/80 px-4 py-2 backdrop-blur-sm">
            {claims?.name && (
                <span className="text-sm font-medium text-stone-900">{claims.name}</span>
            )}
            <button
                onClick={handleSignOut}
                className="rounded-full px-3 py-1 text-xs font-medium text-stone-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
                Sign out
            </button>
        </div>
    );
}
