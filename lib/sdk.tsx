/**
 * ShooAuth SDK for React
 * 
 * Drop-in authentication for your app. Just add your public key.
 * 
 * @example
 * ```tsx
 * import { ShooAuthProvider, useShooAuth } from '@shooauth/react';
 * 
 * function App() {
 *   return (
 *     <ShooAuthProvider publicKey="pk_...">
 *       <YourApp />
 *     </ShooAuthProvider>
 *   );
 * }
 * ```
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";

// Configuration
const SHOO_BASE_URL = process.env.NEXT_PUBLIC_SHOO_BASE_URL || "https://shooauth.com";
const SHOO_AUTH_URL = `${SHOO_BASE_URL}/auth/callback`;

// Types
interface ShooAuthConfig {
    publicKey: string;
    redirectUrl?: string;
    onAuthSuccess?: (user: ShooUser) => void;
    onAuthError?: (error: Error) => void;
}

interface ShooUser {
    userId: string;
    email?: string;
    name?: string;
}

interface ShooAuthState {
    user: ShooUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: Error | null;
}

interface ShooAuthContextValue extends ShooAuthState {
    signIn: () => void;
    signOut: () => void;
    getToken: () => string | null;
}

// Context
const ShooAuthContext = createContext<ShooAuthContextValue | null>(null);

// Storage keys (prefixed with tenant public key for isolation)
const getStorageKey = (publicKey: string, key: string) => {
    const keyHash = publicKey.slice(-8); // Use last 8 chars for brevity
    return `shooauth_${keyHash}_${key}`;
};

// Provider component
interface ShooAuthProviderProps {
    children: ReactNode;
    publicKey: string;
    redirectUrl?: string;
    onAuthSuccess?: (user: ShooUser) => void;
    onAuthError?: (error: Error) => void;
}

export function ShooAuthProvider({
    children,
    publicKey,
    redirectUrl = typeof window !== "undefined" ? window.location.origin : "",
    onAuthSuccess,
    onAuthError,
}: ShooAuthProviderProps) {
    const [state, setState] = useState<ShooAuthState>({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        error: null,
    });

    // Initialize - check for existing session
    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem(getStorageKey(publicKey, "token"));
                const userData = localStorage.getItem(getStorageKey(publicKey, "user"));

                if (token && userData) {
                    // TODO: Verify token with ShooAuth API
                    const user = JSON.parse(userData) as ShooUser;
                    setState({
                        user,
                        isLoading: false,
                        isAuthenticated: true,
                        error: null,
                    });
                    onAuthSuccess?.(user);
                } else {
                    setState((s) => ({ ...s, isLoading: false }));
                }
            } catch (error) {
                const err = error instanceof Error ? error : new Error("Init failed");
                setState({
                    user: null,
                    isLoading: false,
                    isAuthenticated: false,
                    error: err,
                });
                onAuthError?.(err);
            }
        };

        init();

        // Listen for auth callback messages (postMessage from popup)
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== SHOO_BASE_URL) return;

            if (event.data.type === "SHOO_AUTH_SUCCESS") {
                const { token, user } = event.data;
                localStorage.setItem(getStorageKey(publicKey, "token"), token);
                localStorage.setItem(getStorageKey(publicKey, "user"), JSON.stringify(user));

                setState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                    error: null,
                });
                onAuthSuccess?.(user);
            }

            if (event.data.type === "SHOO_AUTH_ERROR") {
                const err = new Error(event.data.error || "Authentication failed");
                setState((s) => ({
                    ...s,
                    isLoading: false,
                    isAuthenticated: false,
                    error: err,
                }));
                onAuthError?.(err);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [publicKey, onAuthSuccess, onAuthError]);

    // Sign in - opens popup to ShooAuth
    const signIn = useCallback(() => {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        const params = new URLSearchParams({
            pk: publicKey,
            redirect: redirectUrl,
        });

        const popup = window.open(
            `${SHOO_AUTH_URL}?${params}`,
            "ShooAuth",
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            // Fallback to redirect if popup blocked
            window.location.href = `${SHOO_AUTH_URL}?${params}`;
        }
    }, [publicKey, redirectUrl]);

    // Sign out
    const signOut = useCallback(() => {
        localStorage.removeItem(getStorageKey(publicKey, "token"));
        localStorage.removeItem(getStorageKey(publicKey, "user"));

        setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
        });
    }, [publicKey]);

    // Get current token
    const getToken = useCallback(() => {
        return localStorage.getItem(getStorageKey(publicKey, "token"));
    }, [publicKey]);

    const value: ShooAuthContextValue = {
        ...state,
        signIn,
        signOut,
        getToken,
    };

    return (
        <ShooAuthContext.Provider value={value}>
            {children}
        </ShooAuthContext.Provider>
    );
}

// Hook
export function useShooAuth(): ShooAuthContextValue {
    const context = useContext(ShooAuthContext);
    if (!context) {
        throw new Error("useShooAuth must be used within a ShooAuthProvider");
    }
    return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> {
    return function ProtectedComponent(props: P) {
        const { isAuthenticated, isLoading, signIn } = useShooAuth();

        if (isLoading) {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <p className="mb-4 text-stone-600">Please sign in to continue</p>
                        <button
                            onClick={signIn}
                            className="rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}

// Pre-built UI Components

interface SignInButtonProps {
    className?: string;
    children?: ReactNode;
}

export function SignInButton({ className = "", children }: SignInButtonProps) {
    const { signIn, isLoading } = useShooAuth();

    return (
        <button
            onClick={signIn}
            disabled={isLoading}
            className={`rounded-full px-6 py-2 font-medium transition-all active:scale-[0.98] disabled:opacity-50 ${className}`}
            style={{
                background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
                boxShadow: "0 1px 0 #1d4ed8, 0 2px 4px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                color: "white",
            }}
        >
            {isLoading ? "Loading..." : children || "Sign In"}
        </button>
    );
}

interface UserProfileProps {
    className?: string;
}

export function UserProfile({ className = "" }: UserProfileProps) {
    const { user, signOut } = useShooAuth();

    if (!user) return null;

    return (
        <div className={`flex items-center gap-3 rounded-full border border-stone-200 bg-white/80 px-4 py-2 backdrop-blur-sm ${className}`}>
            {user.name && (
                <span className="text-sm font-medium text-stone-900">{user.name}</span>
            )}
            <button
                onClick={signOut}
                className="text-sm text-stone-500 transition-colors hover:text-stone-900"
            >
                Sign out
            </button>
        </div>
    );
}

interface AuthStatusProps {
    className?: string;
}

export function AuthStatus({ className = "" }: AuthStatusProps) {
    const { isAuthenticated, isLoading, user, signIn, signOut } = useShooAuth();

    if (isLoading) {
        return (
            <div className={`animate-pulse text-stone-500 ${className}`}>
                Loading...
            </div>
        );
    }

    if (isAuthenticated && user) {
        return <UserProfile className={className} />;
    }

    return <SignInButton className={className} />;
}

// Export types
export type { ShooAuthConfig, ShooUser, ShooAuthState, ShooAuthContextValue };
