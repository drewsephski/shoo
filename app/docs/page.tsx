"use client";

import { useState } from "react";
import Head from "next/head";

const sidebarItems = [
    {
        title: "Getting Started",
        items: [
            { name: "Introduction", href: "#introduction" },
            { name: "Quick Start", href: "#quickstart" },
            { name: "Installation", href: "#installation" },
        ],
    },
    {
        title: "Authentication",
        items: [
            { name: "Email & Password", href: "#email-password" },
            { name: "OAuth Providers", href: "#oauth" },
            { name: "Two-Factor Auth", href: "#2fa" },
            { name: "Session Management", href: "#sessions" },
        ],
    },
    {
        title: "API Reference",
        items: [
            { name: "useShooAuth", href: "#useshooauth" },
            { name: "signIn", href: "#signin" },
            { name: "signOut", href: "#signout" },
            { name: "verifyToken", href: "#verifytoken" },
        ],
    },
    {
        title: "Deployment",
        items: [
            { name: "Environment Variables", href: "#env" },
            { name: "Webhooks", href: "#webhooks" },
            { name: "Security", href: "#security" },
        ],
    },
];

export default function DocsPage() {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("introduction");

    return (
        <>
            <Head>
                <title>Documentation — Shoo Auth</title>
                <meta name="description" content="Documentation for Shoo Auth" />
            </Head>

            <style jsx global>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .font-serif {
                    font-family: "Instrument Serif", Georgia, serif;
                }
                .prose h2 {
                    font-family: "Instrument Serif", Georgia, serif;
                    font-size: 1.75rem;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    color: #1c1917;
                }
                .prose h3 {
                    font-weight: 600;
                    font-size: 1.125rem;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    color: #1c1917;
                }
                .prose p {
                    margin-bottom: 1rem;
                    line-height: 1.75;
                    color: #57534e;
                }
                .prose ul {
                    margin-bottom: 1rem;
                    list-style-type: disc;
                    padding-left: 1.5rem;
                }
                .prose li {
                    margin-bottom: 0.5rem;
                    color: #57534e;
                }
                .prose code {
                    background-color: #f5f5f4;
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                    font-family: var(--font-geist-mono), monospace;
                }
                .prose pre {
                    background-color: #1c1917;
                    color: #e7e5e4;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    overflow-x: auto;
                    margin-bottom: 1.5rem;
                }
                .prose pre code {
                    background-color: transparent;
                    padding: 0;
                    color: inherit;
                }
            `}</style>

            <div className="min-h-screen bg-stone-100 text-stone-900 antialiased pt-20">
                <div className="flex pt-4">
                    {/* Sidebar */}
                    <aside
                        className={`fixed inset-y-0 left-0 z-40 mt-20 w-64 transform overflow-y-auto border-r border-stone-200 bg-white/80 px-4 py-6 backdrop-blur-xl transition-transform lg:sticky lg:top-20 lg:mt-0 lg:translate-x-0 lg:bg-transparent lg:backdrop-blur-none ${
                            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                    >
                        <nav className="space-y-6">
                            {sidebarItems.map((section) => (
                                <div key={section.title}>
                                    <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                                        {section.title}
                                    </h3>
                                    <ul className="space-y-1">
                                        {section.items.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    onClick={() => {
                                                        setActiveSection(item.href.slice(1));
                                                        setMobileSidebarOpen(false);
                                                    }}
                                                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                                                        activeSection === item.href.slice(1)
                                                            ? "bg-stone-200 text-stone-900"
                                                            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                                                    }`}
                                                >
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Overlay for mobile sidebar */}
                    {mobileSidebarOpen && (
                        <div
                            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                    )}

                    {/* Main Content */}
                    <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
                        <div className="prose mx-auto max-w-3xl">
                            <div
                                style={{ animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                            >
                                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-4 py-1.5 text-[13px] text-stone-600 shadow-sm backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                                    Documentation v1.1
                                </span>
                            </div>

                            <h1
                                className="mb-6 font-serif text-4xl font-medium text-stone-900"
                                style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
                            >
                                Documentation
                            </h1>

                            <div style={{ animation: "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}>
                                <h2 id="introduction">Introduction</h2>
                                <p>
                                    Shoo Auth is a modern authentication platform designed for Next.js applications.
                                    It provides secure, flexible authentication with minimal setup and maximum developer experience.
                                </p>
                                <p>
                                    Built on top of Convex, Shoo handles the complexity of user management, session persistence,
                                    and security so you can focus on building your application.
                                </p>

                                <h2 id="quickstart">Quick Start</h2>
                                <p>
                                    Get started with Shoo Auth in under 5 minutes. Our SDK integrates seamlessly with Next.js App Router
                                    and provides everything you need for secure authentication.
                                </p>
                                <pre><code>{`import { useShooAuth } from "@/lib/shoo-convex";

export default function Page() {
  const { signIn, signOut, identity } = useShooAuth();

  return identity.userId ? (
    <button onClick={signOut}>Sign Out</button>
  ) : (
    <button onClick={() => signIn()}>Sign In</button>
  );
}`}</code></pre>

                                <h2 id="installation">Installation</h2>
                                <p>
                                    Shoo Auth works with Next.js 14+ and requires Convex as your backend.
                                    Follow these steps to add authentication to your application.
                                </p>
                                <pre><code>{`# Install the Shoo SDK
npm install @shoo/auth

# Configure environment variables
echo "SHOO_API_KEY=your_api_key" >> .env.local`}</code></pre>

                                <h2 id="email-password">Email & Password</h2>
                                <p>
                                    Email and password authentication is the foundation of Shoo Auth.
                                    Our implementation includes secure password hashing, rate limiting,
                                    and automatic account lockout protection.
                                </p>
                                <pre><code>{`// Sign up with email and password
const { signUp } = useShooAuth();

await signUp({
  email: "user@example.com",
  password: "securePassword123",
});`}</code></pre>

                                <h2 id="oauth">OAuth Providers</h2>
                                <p>
                                    Shoo supports popular OAuth providers out of the box. Enable Google,
                                    GitHub, or custom OAuth integrations with a single configuration.
                                </p>
                                <pre><code>{`// Sign in with Google
await signIn({ provider: "google" });

// Sign in with GitHub
await signIn({ provider: "github" });`}</code></pre>

                                <h2 id="2fa">Two-Factor Auth</h2>
                                <p>
                                    Protect your users with time-based one-time passwords (TOTP).
                                    Shoo makes 2FA setup simple with QR codes and backup codes.
                                </p>
                                <pre><code>{`// Enable 2FA
const { enable2FA } = useShooAuth();

const { qrCode, backupCodes } = await enable2FA();

// Verify 2FA code
await signIn({
  email: "user@example.com",
  password: "password",
  totpCode: "123456",
});`}</code></pre>

                                <h2 id="sessions">Session Management</h2>
                                <p>
                                    Sessions are automatically persisted across browser restarts using secure,
                                    httpOnly cookies. Shoo handles token refresh, expiration, and revocation
                                    without any additional code.
                                </p>

                                <h2 id="useshooauth">useShooAuth Hook</h2>
                                <p>
                                    The primary hook for interacting with Shoo Auth. Provides authentication
                                    state, sign-in methods, and user identity information.
                                </p>
                                <pre><code>{`interface UseShooAuthReturn {
  identity: { userId: string; token: string } | null;
  claims: JWTClaims | null;
  loading: boolean;
  signIn: (options?: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  clearIdentity: () => void;
}`}</code></pre>

                                <h2 id="signin">signIn</h2>
                                <p>
                                    Initiates the authentication flow. Can be used for email/password,
                                    OAuth, or custom authentication methods.
                                </p>
                                <pre><code>{`interface SignInOptions {
  email?: string;
  password?: string;
  provider?: "google" | "github" | "custom";
  requestPii?: boolean; // Request personal info (name, email)
  totpCode?: string; // For 2FA verification
}`}</code></pre>

                                <h2 id="signout">signOut</h2>
                                <p>
                                    Clears the current session and invalidates tokens on the server.
                                    This will trigger a full re-authentication on the next sign-in attempt.
                                </p>
                                <pre><code>{`const { signOut } = useShooAuth();

// Sign out and clear session
await signOut();

// Or clear locally without server call
const { clearIdentity } = useShooAuth();
clearIdentity();`}</code></pre>

                                <h2 id="verifytoken">verifyToken</h2>
                                <p>
                                    Server-side token verification for API routes and middleware.
                                    Validates JWT signatures and checks expiration.
                                </p>
                                <pre><code>{`import { verifyToken } from "@shoo/auth/server";

// In your API route
export async function GET(request: Request) {
  const token = extractToken(request);
  const payload = await verifyToken(token);
  
  if (!payload) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  return Response.json({ userId: payload.sub });
}`}</code></pre>

                                <h2 id="env">Environment Variables</h2>
                                <p>
                                    Configure Shoo Auth using environment variables. These can be set
                                    in your deployment platform or local development environment.
                                </p>
                                <pre><code>{`# Required
SHOO_API_KEY=sk_live_...
SHOO_PROJECT_ID=proj_...

# Optional
SHOO_SESSION_DURATION=86400
SHOO_ENABLE_2FA=true
SHOO_ALLOWED_ORIGINS=https://yourdomain.com`}</code></pre>

                                <h2 id="webhooks">Webhooks</h2>
                                <p>
                                    Receive real-time events for authentication actions. Set up webhooks
                                    in your dashboard to sync user data or trigger custom workflows.
                                </p>
                                <pre><code>{`// Webhook payload structure
{
  "event": "user.sign_in",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "userId": "usr_...",
    "email": "user@example.com",
    "method": "password"
  }
}`}</code></pre>

                                <h2 id="security">Security</h2>
                                <p>
                                    Shoo Auth implements industry-standard security practices:
                                </p>
                                <ul>
                                    <li>Argon2id password hashing with configurable memory and time costs</li>
                                    <li>HTTP-only, SameSite cookies for session tokens</li>
                                    <li>Automatic rate limiting on authentication endpoints</li>
                                    <li>Brute force protection with progressive delays</li>
                                    <li>JWT tokens with short expiration and automatic refresh</li>
                                    <li>Audit logging for all authentication events</li>
                                </ul>
                            </div>
                        </div>
                    </main>
                </div>

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
