"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createShooAuth } from "@shoojs/react";
import { generateDeviceFingerprint } from "@/lib/device";

// Dynamic rendering - this page uses browser APIs (window.location)
export const dynamic = "force-dynamic";

// Create Shoo auth instance lazily to avoid SSR issues
let shooAuth: ReturnType<typeof createShooAuth> | null = null;
function getShooAuth() {
    if (!shooAuth && typeof window !== "undefined") {
        shooAuth = createShooAuth({
            shooBaseUrl: "https://shoo.dev",
            callbackPath: "/auth/callback",
        });
    }
    if (!shooAuth) {
        throw new Error("Shoo auth not available");
    }
    return shooAuth;
}

// Simple hash function for token hashing (for demo purposes)
// In production, use a proper crypto library
async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const getOrCreateUser = useMutation(api.users.getOrCreateUser);
    const createSession = useMutation(api.sessions.createSession);
    const checkRateLimit = useMutation(api.rateLimit.checkRateLimit);
    const incrementRateLimit = useMutation(api.rateLimit.incrementRateLimit);
    const logAuthEvent = useMutation(api.audit.logAuthEvent);

    useEffect(() => {
        async function processCallback() {
            try {
                // Check if already authenticated (e.g., from previous successful exchange)
                const existingIdentity = getShooAuth().getIdentity();
                if (existingIdentity?.userId) {
                    console.log("Already authenticated, redirecting to dashboard...");
                    window.location.href = "/dashboard";
                    return;
                }

                // Check for error in URL
                const errorParam = searchParams.get("error");
                if (errorParam) {
                    setError(`Authentication error: ${errorParam}`);
                    return;
                }

                // Use finishSignIn directly with redirectAfter: false
                // This exchanges the code and stores identity WITHOUT redirecting
                const token = await getShooAuth().finishSignIn({
                    redirectAfter: false,
                    clearCallbackParams: true,
                });
                
                if (!token?.id_token) {
                    setError("Failed to exchange authorization code for token");
                    return;
                }

                console.log("Token exchange successful, userId:", token.pairwise_sub);

                // Verify token with backend
                const res = await fetch("/api/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken: token.id_token }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || "Token verification failed");
                    return;
                }

                const data = await res.json();
                console.log("Server-verified userId:", data.userId);

                // Sync user to Convex
                try {
                    await getOrCreateUser({
                        userId: data.userId,
                        email: data.email,
                        name: data.name,
                    });
                    console.log("User synced to Convex");
                } catch (err) {
                    console.error("Failed to sync user to Convex:", err);
                    setError("Failed to create user record");
                    return;
                }

                // Create session record with device metadata
                try {
                    const tokenHash = await hashToken(token.id_token);
                    // Session expires in 30 days
                    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
                    
                    // Capture device info
                    const userAgent = navigator.userAgent;
                    // Note: IP address is captured server-side in the API route
                    const deviceFingerprint = generateDeviceFingerprint("client", userAgent);
                    
                    await createSession({
                        userId: data.userId,
                        tokenHash,
                        expiresAt,
                        ipAddress: undefined, // Set server-side
                        userAgent,
                        deviceFingerprint,
                    });
                    console.log("Session created in Convex with device metadata");
                } catch (err) {
                    console.error("Failed to create session:", err);
                    // Don't fail sign-in if session creation fails
                }

                setVerified(true);
                console.log("Redirecting to dashboard...");
                
                // Use window.location for a full page reload to ensure auth state is fresh
                window.location.href = "/dashboard";
            } catch (err) {
                console.error("Callback error:", err);
                // Check if auth actually succeeded despite the error
                const identity = getShooAuth().getIdentity();
                if (identity?.userId) {
                    console.log("Auth succeeded despite error, redirecting...");
                    window.location.href = "/dashboard";
                    return;
                }
                setError(err instanceof Error ? err.message : "Authentication error");
            }
        }

        processCallback();
    }, [searchParams, router, getOrCreateUser, createSession, checkRateLimit, incrementRateLimit, logAuthEvent]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center max-w-md px-4">
                    <div className="flex justify-center mb-6">
                        <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                    </div>
                    <p className="font-serif text-lg text-stone-800 mb-2">Authentication Failed</p>
                    <p className="text-stone-500 text-sm mb-6">{error}</p>
                    <button 
                        onClick={() => router.push("/")}
                        className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)" }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

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
                <p className="font-serif text-lg text-stone-800">{verified ? "Redirecting..." : "Completing sign-in..."}</p>
                <p className="text-stone-500 text-sm mt-2">Please wait a moment</p>
            </div>
        </div>
    );
}

export default function ShooCallback() {
    return (
        <Suspense fallback={
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
                    <p className="font-serif text-lg text-stone-800">Loading...</p>
                    <p className="text-stone-500 text-sm mt-2">Please wait a moment</p>
                </div>
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
