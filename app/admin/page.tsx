"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}

function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = timestamp - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h remaining`;
    }
    if (hours > 0) {
        return `${hours}h remaining`;
    }
    return "< 1h remaining";
}

// Format device fingerprint for display
function formatDeviceFingerprint(fingerprint?: string): string {
    if (!fingerprint || fingerprint.length < 8) return "Unknown device";
    return `Device ${fingerprint.slice(0, 8)}...`;
}

// Parse user agent to get browser info
function getBrowserInfo(userAgent?: string): string {
    if (!userAgent) return "Unknown browser";
    const ua = userAgent.toLowerCase();
    if (ua.includes("chrome")) return "Chrome";
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("safari")) return "Safari";
    if (ua.includes("edge")) return "Edge";
    return "Browser";
}

// Custom Dialog Component
function Dialog({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    action,
    actionLabel = "Confirm",
    actionVariant = "primary"
}: { 
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    action?: () => void;
    actionLabel?: string;
    actionVariant?: "primary" | "danger";
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Dialog */}
            <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium text-stone-900">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="mb-6 text-stone-600">{children}</div>
                
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                    >
                        Cancel
                    </button>
                    {action && (
                        <button
                            onClick={() => { action(); onClose(); }}
                            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition-all ${
                                actionVariant === "danger" 
                                    ? "bg-red-600 hover:bg-red-700" 
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const users = useQuery(api.users.listUsers);
    const allSessions = useQuery(api.sessions.getAllActiveSessions);
    const revokeSession = useMutation(api.sessions.revokeSession);
    const revokeAllSessions = useMutation(api.sessions.revokeAllUserSessions);
    const cleanupExpired = useMutation(api.sessions.cleanupExpiredSessions);
    
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isCleaning, setIsCleaning] = useState(false);
    
    // Dialog states
    const [showCleanupDialog, setShowCleanupDialog] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [cleanupResult, setCleanupResult] = useState<{ deletedCount: number } | null>(null);

    const handleRevokeSession = async (sessionId: string) => {
        try {
            await revokeSession({ sessionId: sessionId as any });
        } catch (err) {
            console.error("Failed to revoke session:", err);
        }
    };

    const handleRevokeAllForUser = async (userId: string) => {
        try {
            await revokeAllSessions({ userId });
        } catch (err) {
            console.error("Failed to revoke all sessions:", err);
        }
    };

    const handleCleanupConfirm = async () => {
        setIsCleaning(true);
        setShowCleanupDialog(false);
        
        try {
            const result = await cleanupExpired({});
            setCleanupResult(result);
            setShowResultDialog(true);
        } catch (err) {
            console.error("Failed to cleanup:", err);
        } finally {
            setIsCleaning(false);
        }
    };

    const selectedUserData = users?.find((u) => u.userId === selectedUser);
    const selectedUserSessions = allSessions?.filter((s) => s.userId === selectedUser);

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-serif text-2xl font-medium tracking-tight text-stone-900">
                                Admin Dashboard
                            </h1>
                            <p className="mt-1 text-sm text-stone-500">
                                Manage users and their active sessions
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCleanupDialog(true)}
                            disabled={isCleaning}
                            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 disabled:opacity-50"
                        >
                            {isCleaning ? (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                            )}
                            Cleanup Expired
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats */}
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v.003A9.338 9.338 0 016.678 15m0 0a9.338 9.338 0 019.441-4.81m-9.441 4.81a9.338 9.338 0 019.441-4.81M6.678 15a9.338 9.338 0 0115-4.81M15 10.19v.003a9.338 9.338 0 01-9.441 4.81m9.441-4.81a9.338 9.338 0 00-9.441-4.81M6.678 15a9.338 9.338 0 01-2.184-.503 3.375 3.375 0 01-1.612-1.612C2.878 12.266 2.878 11.734 2.878 11.734s0-.532.586-1.151a3.375 3.375 0 011.612-1.612c.618-.586 1.151-.586 1.151-.586" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-stone-500">Total Users</p>
                                <p className="text-2xl font-semibold text-stone-900">{users?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-stone-500">Active Sessions</p>
                                <p className="text-2xl font-semibold text-stone-900">{allSessions?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-stone-500">Avg Sessions/User</p>
                                <p className="text-2xl font-semibold text-stone-900">
                                    {users?.length ? Math.round((allSessions?.length || 0) / users.length * 10) / 10 : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Users List */}
                    <div className="rounded-2xl border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 px-6 py-4">
                            <h2 className="font-serif text-lg font-medium text-stone-900">Users</h2>
                            <p className="text-sm text-stone-500">Click a user to view their sessions</p>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {users?.map((user) => {
                                const sessionCount = allSessions?.filter((s) => s.userId === user.userId).length || 0;
                                const isSelected = selectedUser === user.userId;
                                
                                return (
                                    <button
                                        key={user._id}
                                        onClick={() => setSelectedUser(user.userId)}
                                        className={`flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-stone-50 ${
                                            isSelected ? "bg-blue-50/50" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                                                <span className="text-sm font-medium">
                                                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-stone-900">{user.name || "Unnamed User"}</p>
                                                <p className="text-sm text-stone-500">{user.email || "No email"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                sessionCount > 0 
                                                    ? "bg-emerald-50 text-emerald-700" 
                                                    : "bg-stone-100 text-stone-600"
                                            }`}>
                                                {sessionCount} session{sessionCount !== 1 ? "s" : ""}
                                            </span>
                                            <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Session Details */}
                    <div className="rounded-2xl border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 px-6 py-4">
                            <h2 className="font-serif text-lg font-medium text-stone-900">
                                {selectedUser ? "User Sessions" : "All Active Sessions"}
                            </h2>
                            <p className="text-sm text-stone-500">
                                {selectedUser 
                                    ? `Managing sessions for ${selectedUserData?.name || selectedUserData?.email || "selected user"}`
                                    : "Viewing all active sessions across users"
                                }
                            </p>
                        </div>
                        
                        {selectedUser && (
                            <div className="border-b border-stone-200 bg-stone-50/50 px-6 py-3">
                                <button
                                    onClick={() => handleRevokeAllForUser(selectedUser)}
                                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                    </svg>
                                    Force Logout All Devices
                                </button>
                            </div>
                        )}
                        
                        <div className="max-h-96 overflow-y-auto">
                            {(selectedUser ? selectedUserSessions : allSessions)?.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
                                        <svg className="h-6 w-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.356.108-.699.312-.997l9-13.5A.75.75 0 0112 4.5h.001Z" />
                                        </svg>
                                    </div>
                                    <p className="text-stone-500">No active sessions</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-100">
                                    {(selectedUser ? selectedUserSessions : allSessions)?.map((session) => (
                                        <div key={session._id} className="flex items-center justify-between px-6 py-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                                                    <p className="font-medium text-stone-900">
                                                        {!selectedUser && session.userEmail}
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-xs text-stone-500">
                                                    Created {formatDate(session.createdAt)}
                                                </p>
                                                <p className="text-xs text-stone-400">
                                                    Expires {formatRelativeTime(session.expiresAt)}
                                                </p>
                                                {/* Device fingerprint info */}
                                                <p className="mt-1 text-xs text-stone-500">
                                                    <span className="inline-flex items-center gap-1">
                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.309 48.309 0 01-8.135-1.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                                                        </svg>
                                                        {formatDeviceFingerprint(session.deviceFingerprint)}
                                                        {session.userAgent && (
                                                            <span className="text-stone-400">({getBrowserInfo(session.userAgent)})</span>
                                                        )}
                                                    </span>
                                                </p>
                                                <p className="mt-1 truncate font-mono text-[10px] text-stone-300">
                                                    {session.tokenHash.slice(0, 16)}...
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRevokeSession(session._id)}
                                                className="ml-4 flex-shrink-0 rounded-lg border border-stone-200 p-2 text-stone-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                title="Revoke session"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Cleanup Confirmation Dialog */}
            <Dialog
                isOpen={showCleanupDialog}
                onClose={() => setShowCleanupDialog(false)}
                title="Clean Up Expired Sessions"
                action={handleCleanupConfirm}
                actionLabel="Clean Up"
                actionVariant="primary"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
                        <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-stone-600">
                            This will permanently delete all expired sessions from the database. 
                            Active sessions will not be affected.
                        </p>
                        <p className="mt-2 text-xs text-stone-400">
                            This action cannot be undone.
                        </p>
                    </div>
                </div>
            </Dialog>

            {/* Cleanup Result Dialog */}
            <Dialog
                isOpen={showResultDialog}
                onClose={() => setShowResultDialog(false)}
                title="Cleanup Complete"
                action={() => setShowResultDialog(false)}
                actionLabel="Got it"
                actionVariant="primary"
            >
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-stone-600">
                            Successfully cleaned up <strong className="text-stone-900">{cleanupResult?.deletedCount || 0}</strong> expired session{cleanupResult?.deletedCount === 1 ? "" : "s"}.
                        </p>
                        <p className="mt-2 text-xs text-stone-400">
                            The database has been updated.
                        </p>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
