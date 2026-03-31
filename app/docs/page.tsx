"use client";

import { useState } from "react";
import Head from "next/head";
import { CodeBlock } from "@/components/code-block";

const sidebarItems = [
    {
        title: "Getting Started",
        items: [
            { name: "Introduction", href: "#introduction" },
            { name: "Quick Start", href: "#quickstart" },
            { name: "SDK Installation", href: "#installation" },
        ],
    },
    {
        title: "Authentication",
        items: [
            { name: "OAuth with Shoo", href: "#oauth" },
            { name: "OAuth Callback", href: "#callback" },
            { name: "Session Management", href: "#sessions" },
        ],
    },
    {
        title: "API Reference",
        items: [
            { name: "useShooAuth", href: "#useshooauth" },
            { name: "signIn", href: "#signin" },
            { name: "Configuration", href: "#config" },
            { name: "Clear Identity", href: "#signout" },
            { name: "Token Verification", href: "#verifytoken" },
        ],
    },
    {
        title: "Deployment",
        items: [
            { name: "Environment Setup", href: "#env" },
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
                html {
                    scroll-behavior: smooth;
                }
            `}</style>

            <div className="min-h-screen bg-stone-100 text-stone-900 antialiased pt-20">
                <div className="flex pt-4">
                    {/* Sidebar */}
                    <aside
                        className={`fixed inset-y-0 left-0 z-40 mt-20 w-64 transform overflow-y-auto border-r border-stone-200 bg-white/80 px-4 py-6 backdrop-blur-xl transition-all duration-300 ease-out lg:sticky lg:top-20 lg:mt-0 lg:h-[calc(100vh-5rem)] lg:translate-x-0 lg:bg-transparent lg:backdrop-blur-none ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setActiveSection(item.href.slice(1));
                                                        setMobileSidebarOpen(false);
                                                        const element = document.querySelector(item.href);
                                                        if (element) {
                                                            const offset = 100; // Account for fixed header
                                                            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                                                            window.scrollTo({
                                                                top: elementPosition - offset,
                                                                behavior: "smooth"
                                                            });
                                                        }
                                                    }}
                                                    className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${activeSection === item.href.slice(1)
                                                            ? "bg-stone-200 text-stone-900 translate-x-1"
                                                            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 hover:translate-x-1"
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
                                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-4 py-1.5 text-[13px] text-amber-700 shadow-sm backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                    Early WIP — Use at your own risk
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
                                    Shoo is a free, open-source OAuth provider that lets you add secure authentication
                                    to any application in minutes. No signup required, no API keys, no backend needed.
                                </p>
                                <p>
                                    Point your redirect URI to <code>shooauth.com</code> and go. Shoo handles the OAuth flow,
                                    identity tokens, and session management. You get verified user identities via JWT.
                                </p>

                                <h2 id="quickstart">Quick Start</h2>
                                <p>
                                    Add Shoo to any app with just 2 lines of code. Works with React, Vue, vanilla JS,
                                    or any framework.
                                </p>
                                <CodeBlock
                                    code={`<!-- 1. Add the script -->
<script src="https://shooauth.com/shoo.js"></script>

<!-- 2. Add a login link -->
<a href="https://shooauth.com/sign-in?redirect_uri=https://yourapp.com/callback">
  Login
</a>`}
                                    language="html"
                                />

                                <h2 id="installation">SDK Installation</h2>
                                <p>
                                    For React apps, use our official SDK for a smoother integration with hooks and
                                    automatic session management.
                                </p>
                                <CodeBlock
                                    code={`# Install the Shoo React SDK
bun add @shoojs/react @shoojs/auth

# Or use the CDN (works with any framework)
<script src="https://cdn.jsdelivr.net/npm/@shoojs/auth"></script>`}
                                    language="bash"
                                />

                                <h2 id="oauth">OAuth with Shoo</h2>
                                <p>
                                    Shoo provides OAuth/OpenID Connect authentication. Users are redirected to shooauth.com
                                    to complete sign-in, then returned to your application with a verified identity token.
                                </p>
                                <CodeBlock
                                    code={`// Sign in with Shoo (redirects to shooauth.com)
await signIn({ requestPii: true });  // Request name/email

// Or minimal sign-in (just userId)
await signIn();`}
                                    language="typescript"
                                />


                                <h2 id="sessions">Session Management</h2>
                                <p>
                                    Shoo handles sessions automatically. Tokens are stored in localStorage and
                                    refreshed as needed. The React SDK provides automatic session monitoring.
                                </p>
                                <CodeBlock
                                    code={`const { sessionState, checkSession } = useShooAuth();

// Session states: "unknown" | "active" | "login_required"
if (sessionState === "login_required") {
  // Redirect to sign in
}

// Explicitly check session validity
const result = await checkSession();
// { status: "active" } | { status: "login_required", reason: "expired" | "revoked" | "invalid_token" }`}
                                    language="typescript"
                                />

                                <h2 id="callback">OAuth Callback</h2>
                                <p>
                                    Create a callback page to handle the OAuth redirect. Works in any framework.
                                </p>
                                <CodeBlock
                                    code={`// Next.js, React, or any framework
import { useShooAuth } from "@shoojs/react";

export default function Callback() {
  const { handleCallback } = useShooAuth();

  useEffect(() => {
    handleCallback({ redirectAfter: false })
      .then((token) => {
        if (token?.id_token) {
          // Token contains: pairwise_sub, email, name (if requested)
          window.location.href = "/dashboard";
        }
      });
  }, []);

  return <div>Signing in...</div>;
}`}
                                    language="typescript"
                                    filename="callback.tsx"
                                />

                                <h2 id="useshooauth">useShooAuth Hook</h2>
                                <p>
                                    The primary hook for interacting with Shoo Auth. Provides authentication
                                    state, sign-in methods, and user identity information.
                                </p>
                                <CodeBlock
                                    code={`interface UseShooAuthReturn {
  identity: ShooIdentity;           // { userId: string | null; token?: string; expiresIn?: number; }
  claims: IdentityClaims | null;    // Decoded JWT claims (pairwise_sub, email, name, etc.)
  loading: boolean;
  sessionState: "unknown" | "active" | "login_required";
  error: string | null;
  // Actions
  signIn: (options?: StartSignInOptions) => Promise<void>;
  handleCallback: (options?: HandleCallbackOptions) => Promise<TokenResponse | null>;
  checkSession: () => Promise<SessionCheckResult>;
  refreshIdentity: () => void;
  clearIdentity: () => void;
  // Client reference
  authClient: ShooAuthClient | null;
}`}
                                    language="typescript"
                                />

                                <h2 id="config">Configuration Options</h2>
                                <CodeBlock
                                    code={`useShooAuth({
  shooBaseUrl: "https://shooauth.com",      // Shoo OAuth server
  callbackPath: "/auth/callback",       // OAuth callback route
  autoHandleCallback: true,             // Auto-process callback params
  autoSessionMonitor: true,             // Enable background session checks
  sessionMonitorIntervalMs: 60000,      // Check interval (default: 60s)
});`}
                                    language="typescript"
                                />

                                <h2 id="signin">signIn</h2>
                                <p>
                                    Initiates the OAuth authentication flow by redirecting to Shoo.
                                    After successful authentication, the user is redirected back to your callback path.
                                </p>
                                <CodeBlock
                                    code={`interface StartSignInOptions {
  requestPii?: boolean;      // Request personal info (name, email)
  returnTo?: string;        // Path to redirect after sign-in
  redirectUri?: string;     // Override the OAuth redirect URI
  clientId?: string;        // Override the OAuth client ID
  shooBaseUrl?: string;     // Override the Shoo server URL
}`}
                                    language="typescript"
                                />

                                <h2 id="callback-handler">OAuth Callback Handler</h2>
                                <p>
                                    Handle the OAuth callback after the user returns from Shoo.
                                    Exchange the authorization code for tokens and establish the session.
                                </p>
                                <p>
                                    The <code>handleCallback</code> method is available from the React hook. For direct
                                    client usage, use <code>finishSignIn</code> from the auth client.
                                </p>
                                <CodeBlock
                                    code={`"use client";

import { useEffect } from "react";
import { useShooAuth } from "@shoojs/react";

export default function AuthCallback() {
  const { handleCallback } = useShooAuth();

  useEffect(() => {
    handleCallback({ redirectAfter: false })
      .then((token) => {
        if (token) {
          // Verify token with your backend
          window.location.href = "/dashboard";
        }
      });
  }, [handleCallback]);

  return <div>Completing sign-in...</div>;
}`}
                                    language="typescript"
                                    filename="auth/callback/page.tsx"
                                />

                                <h2 id="signout">Clear Identity / Sign Out</h2>
                                <p>
                                    Clear the local session. Shoo is stateless — there&apos;s no server-side session to invalidate.
                                </p>
                                <CodeBlock
                                    code={`const { clearIdentity } = useShooAuth();

// Clear local session
clearIdentity();`}
                                    language="typescript"
                                />

                                <h2 id="verifytoken">Token Verification</h2>
                                <p>
                                    Verify Shoo ID tokens server-side using JWKS. The tokens are JWTs signed
                                    by Shoo&apos;s keys and contain the user&apos;s pairwise_sub claim (unique per app).
                                </p>
                                <CodeBlock
                                    code={`import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(
  new URL("/.well-known/jwks.json", "https://shooauth.com")
);

// In your API route
export async function POST(request: Request) {
  const { idToken } = await request.json();
  
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: "https://shooauth.com",
    audience: "origin:https://yourdomain.com",
  });
  
  // payload.pairwise_sub contains the unique user ID
  return Response.json({ userId: payload.pairwise_sub });
}`}
                                    language="typescript"
                                    filename="api/verify/route.ts"
                                />

                                <h2 id="env">Environment Setup</h2>
                                <p>
                                    No environment variables required for basic usage. Just point your redirect URI to shooauth.com.
                                    For the React SDK, you can optionally configure the base URL.
                                </p>
                                <CodeBlock
                                    code={`// Optional: Configure SDK (defaults shown)
useShooAuth({
  shooBaseUrl: "https://shooauth.com",
  callbackPath: "/auth/callback",
});`}
                                    language="typescript"
                                />

                                <h2 id="security">Security</h2>
                                <p>
                                    Shoo implements OAuth 2.0 with PKCE and OpenID Connect:
                                </p>
                                <ul>
                                    <li>Pairwise user IDs (privacy-preserving, different per app)</li>
                                    <li>JWKS-based JWT verification with RS256 signatures</li>
                                    <li>Origin-bound tokens (audience validation prevents cross-site replay)</li>
                                    <li>PKCE flow for OAuth authorization code exchange</li>
                                    <li>30-day token expiration</li>
                                    <li>No backend required — Shoo handles all OAuth server-side</li>
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
                                © 2026 Shoo Auth. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
