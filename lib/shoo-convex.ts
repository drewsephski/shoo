"use client";

import { createShooConvexAuth, useShooAuth as useShooAuthLib, type ShooAuthOptions } from "@shoojs/react";

// Shared auth configuration - centralized so all components use same config
const SHOO_CONFIG: ShooAuthOptions & { autoHandleCallback?: boolean } = {
    shooBaseUrl: "https://shoo.dev",
    callbackPath: "/auth/callback",
    autoHandleCallback: false, // Disable auto-handling - we handle it manually in callback page
};

// Lazy initialization - only create in browser to avoid SSR issues
let convexAuthModule: ReturnType<typeof createShooConvexAuth> | null = null;

function getConvexAuth() {
    if (typeof window === "undefined") {
        // SSR: return mock that matches the interface
        return {
            useAuth: () => ({
                isLoading: true,
                isAuthenticated: false,
                fetchAccessToken: async () => null,
            }),
            signIn: async () => { throw new Error("Auth not available during SSR"); },
            signOut: () => { throw new Error("Auth not available during SSR"); },
        };
    }
    if (!convexAuthModule) {
        convexAuthModule = createShooConvexAuth(SHOO_CONFIG);
    }
    return convexAuthModule;
}

// Convex-compatible useAuth hook for ConvexProviderWithAuth
// Uses lazy initialization to avoid SSR issues
export function useAuth() {
    return getConvexAuth().useAuth();
}

// Export signIn/signOut for components - lazy wrappers
export const signIn = async (...args: Parameters<ReturnType<typeof createShooConvexAuth>["signIn"]>) => {
    return getConvexAuth().signIn(...args);
};

export const signOut = (...args: Parameters<ReturnType<typeof createShooConvexAuth>["signOut"]>) => {
    return getConvexAuth().signOut(...args);
};

// Centralized useShooAuth hook for components
// This ensures all components share the same auth configuration and state
export function useShooAuth() {
    return useShooAuthLib(SHOO_CONFIG);
}