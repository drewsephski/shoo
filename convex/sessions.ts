// Convex functions for session management with Shoo auth

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new session (called during sign-in)
export const createSession = mutation({
    args: {
        userId: v.string(),
        tokenHash: v.string(),
        expiresAt: v.number(),
        // Device metadata for security tracking
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        deviceFingerprint: v.optional(v.string()),
    },
    handler: async (ctx, { userId, tokenHash, expiresAt, ipAddress, userAgent, deviceFingerprint }) => {
        const now = Date.now();
        
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

// Get all active sessions for a user
export const getUserSessions = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, { userId }) => {
        const now = Date.now();
        const sessions = await ctx.db
            .query("userSessions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        
        // Filter out expired sessions and sort by creation date (newest first)
        return sessions
            .filter((s) => s.expiresAt > now)
            .sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Get session by token hash (for validation)
export const getSessionByToken = query({
    args: {
        tokenHash: v.string(),
    },
    handler: async (ctx, { tokenHash }) => {
        const now = Date.now();
        const session = await ctx.db
            .query("userSessions")
            .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
            .unique();
        
        if (!session || session.expiresAt <= now) {
            return null;
        }
        
        return session;
    },
});

// Revoke a specific session
export const revokeSession = mutation({
    args: {
        sessionId: v.id("userSessions"),
    },
    handler: async (ctx, { sessionId }) => {
        await ctx.db.delete(sessionId);
        return true;
    },
});

// Revoke all sessions for a user (force logout everywhere)
export const revokeAllUserSessions = mutation({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, { userId }) => {
        const sessions = await ctx.db
            .query("userSessions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        
        // Delete all sessions
        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }
        
        return { revokedCount: sessions.length };
    },
});

// Get all active sessions across all users (for admin dashboard)
export const getAllActiveSessions = query({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const sessions = await ctx.db.query("userSessions").collect();
        
        // Filter active sessions and enrich with user data
        const activeSessions = sessions.filter((s) => s.expiresAt > now);
        
        // Fetch user data for each session
        const enrichedSessions = await Promise.all(
            activeSessions.map(async (session) => {
                const user = await ctx.db
                    .query("users")
                    .withIndex("by_userId", (q) => q.eq("userId", session.userId))
                    .unique();
                
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

// Clean up expired sessions (can be run periodically)
export const cleanupExpiredSessions = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const sessions = await ctx.db.query("userSessions").collect();
        
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
