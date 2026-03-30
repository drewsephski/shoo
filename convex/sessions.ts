// Convex functions for session management with Shoo auth

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new session (called during sign-in) - supports both legacy and tenant modes
export const createSession = mutation({
    args: {
        tenantId: v.optional(v.id("tenants")),
        userId: v.string(),
        tokenHash: v.string(),
        expiresAt: v.number(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        deviceFingerprint: v.optional(v.string()),
    },
    handler: async (ctx, { tenantId, userId, tokenHash, expiresAt, ipAddress, userAgent, deviceFingerprint }) => {
        const now = Date.now();

        if (tenantId) {
            // TENANT MODE: Check session limits
            const tenant = await ctx.db.get(tenantId);
            if (!tenant) throw new Error("Tenant not found");

            const existingSessions = await ctx.db
                .query("userSessions")
                .withIndex("by_tenantId_userId", (q) => q.eq("tenantId", tenantId).eq("userId", userId))
                .collect();

            const activeSessions = existingSessions.filter((s) => s.expiresAt > now);

            if (activeSessions.length >= tenant.maxSessionsPerUser) {
                const oldestSession = activeSessions.sort((a, b) => a.createdAt - b.createdAt)[0];
                if (oldestSession) {
                    await ctx.db.delete(oldestSession._id);
                }
            }

            const sessionId = await ctx.db.insert("userSessions", {
                tenantId,
                userId,
                tokenHash,
                createdAt: now,
                expiresAt,
                ipAddress,
                userAgent,
                deviceFingerprint,
                lastActiveAt: now,
            });

            return await ctx.db.get(sessionId);
        }

        // LEGACY MODE: Create session without tenant
        const sessionId = await ctx.db.insert("userSessions", {
            userId,
            tokenHash,
            createdAt: now,
            expiresAt,
            ipAddress,
            userAgent,
            deviceFingerprint,
            lastActiveAt: now,
        });

        return await ctx.db.get(sessionId);
    },
});

// Get all active sessions for a user (supports both modes)
export const getUserSessions = query({
    args: {
        tenantId: v.optional(v.id("tenants")),
        userId: v.string(),
    },
    handler: async (ctx, { tenantId, userId }) => {
        const now = Date.now();
        let sessions;

        if (tenantId) {
            sessions = await ctx.db
                .query("userSessions")
                .withIndex("by_tenantId_userId", (q) => q.eq("tenantId", tenantId).eq("userId", userId))
                .collect();
        } else {
            // Legacy mode
            sessions = await ctx.db
                .query("userSessions")
                .filter((q) => q.eq(q.field("userId"), userId))
                .collect();
        }

        return sessions
            .filter((s) => s.expiresAt > now)
            .sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Get session by token hash (for validation) - tenant isolated
export const getSessionByToken = query({
    args: {
        tenantId: v.id("tenants"),
        tokenHash: v.string(),
    },
    handler: async (ctx, { tenantId, tokenHash }) => {
        const now = Date.now();
        const session = await ctx.db
            .query("userSessions")
            .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
            .filter((q) => q.eq(q.field("tenantId"), tenantId))
            .unique();

        if (!session || session.expiresAt <= now) {
            return null;
        }

        return session;
    },
});

// Revoke a specific session (supports both modes)
export const revokeSession = mutation({
    args: {
        tenantId: v.optional(v.id("tenants")),
        sessionId: v.id("userSessions"),
    },
    handler: async (ctx, { tenantId, sessionId }) => {
        const session = await ctx.db.get(sessionId);
        if (!session) throw new Error("Session not found");
        
        // If tenantId provided, verify session belongs to tenant
        if (tenantId && session.tenantId !== tenantId) {
            throw new Error("Session not found in tenant");
        }
        
        await ctx.db.delete(sessionId);
        return true;
    },
});

// Revoke all sessions for a user (force logout everywhere) - supports both modes
export const revokeAllUserSessions = mutation({
    args: {
        tenantId: v.optional(v.id("tenants")),
        userId: v.string(),
    },
    handler: async (ctx, { tenantId, userId }) => {
        let sessions;
        
        if (tenantId) {
            sessions = await ctx.db
                .query("userSessions")
                .withIndex("by_tenantId_userId", (q) => q.eq("tenantId", tenantId).eq("userId", userId))
                .collect();
        } else {
            // Legacy mode - find all sessions for user
            sessions = await ctx.db
                .query("userSessions")
                .filter((q) => q.eq(q.field("userId"), userId))
                .collect();
        }

        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }

        return { revokedCount: sessions.length };
    },
});

// Get all active sessions (supports both tenant-scoped and global admin view)
export const getAllActiveSessions = query({
    args: {
        tenantId: v.optional(v.id("tenants")),
    },
    handler: async (ctx, { tenantId }) => {
        const now = Date.now();
        let sessions;
        
        if (tenantId) {
            sessions = await ctx.db
                .query("userSessions")
                .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
                .collect();
        } else {
            // Legacy mode - get all sessions
            sessions = await ctx.db.query("userSessions").collect();
        }

        const activeSessions = sessions.filter((s) => s.expiresAt > now);

        // Fetch user data for each session
        const enrichedSessions = await Promise.all(
            activeSessions.map(async (session) => {
                let user;
                if (tenantId) {
                    user = await ctx.db
                        .query("users")
                        .withIndex("by_tenantId_userId", (q) =>
                            q.eq("tenantId", tenantId).eq("userId", session.userId)
                        )
                        .unique();
                } else {
                    // Legacy mode - find user by userId
                    user = await ctx.db
                        .query("users")
                        .filter((q) => q.eq(q.field("userId"), session.userId))
                        .first();
                }

                return {
                    ...session,
                    userEmail: user?.email || "Unknown",
                    userName: user?.name || "Unknown",
                };
            })
        );

        return enrichedSessions.sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Clean up expired sessions (supports both tenant-scoped and global cleanup)
export const cleanupExpiredSessions = mutation({
    args: {
        tenantId: v.optional(v.id("tenants")),
    },
    handler: async (ctx, { tenantId }) => {
        const now = Date.now();
        let sessions;
        
        if (tenantId) {
            sessions = await ctx.db
                .query("userSessions")
                .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
                .collect();
        } else {
            // Legacy mode - get all sessions
            sessions = await ctx.db.query("userSessions").collect();
        }

        let deletedCount = 0;
        for (const session of sessions) {
            if (session.expiresAt <= now) {
                await ctx.db.delete(session._id);
                deletedCount++;
            }
        }

        return { deletedCount };
    },
});
