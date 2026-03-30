"use client";

import {
    createShooAuth,
    useShooAuth,
} from "@shoojs/react";
import type {
    HandleCallbackOptions,
    ShooAuthClient,
    ShooAuthOptions,
    ShooIdentity,
    StartSignInOptions,
    TokenResponse,
} from "@shoojs/react";

// Example: Manual client creation (not usually needed, useShooAuth does this)
export const manualClient = typeof window !== "undefined"
    ? createShooAuth({
          shooBaseUrl: "https://shoo.dev",
          callbackPath: "/auth/callback",
      })
    : null;

// Example: All hook properties demonstrated
export function useShooAuthDemo() {
    const {
        identity,           // Current identity state (userId, token, etc.)
        claims,             // Decoded (unverified) token claims
        sessionState,       // "unknown" | "active" | "login_required"
        loading,            // true while initializing
        error,              // Error message if init failed
        signIn,             // Start sign-in flow
        handleCallback,     // Manually handle callback
        checkSession,       // Validate token/session
        refreshIdentity,    // Re-read from localStorage
        clearIdentity,      // Sign out
        authClient,         // Underlying ShooAuthClient
    } = useShooAuth({
        // Options
        shooBaseUrl: "https://shoo.dev",
        callbackPath: "/auth/callback",
        autoHandleCallback: true,   // Auto exchange code on mount
        autoSessionMonitor: true,   // Background session checks
        sessionMonitorIntervalMs: 60000, // Check every minute
    });

    return {
        identity,
        claims,
        sessionState,
        loading,
        error,
        signIn,
        handleCallback,
        checkSession,
        refreshIdentity,
        clearIdentity,
        authClient,
    };
}

// Re-export types for convenience
export type {
    HandleCallbackOptions,
    ShooAuthClient,
    ShooAuthOptions,
    ShooIdentity,
    StartSignInOptions,
    TokenResponse,
};
