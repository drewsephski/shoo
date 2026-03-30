// Convex audit logging for authentication events

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Event types for audit logging
export type AuthEventType =
    | "sign_in_success"
    | "sign_in_failure"
    | "session_created"
    | "session_revoked"
    | "all_sessions_revoked"
    | "rate_limit_exceeded"
    | "token_verification_failed";

/**
 * Log an authentication event
 * Called from auth flows to create security audit trail
 */
export const logAuthEvent = mutation({
    args: {
        userId: v.optional(v.string()),
        event: v.union(
            v.literal("sign_in_success"),
            v.literal("sign_in_failure"),
            v.literal("session_created"),
            v.literal("session_revoked"),
            v.literal("all_sessions_revoked"),
            v.literal("rate_limit_exceeded"),
            v.literal("token_verification_failed")
        ),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        metadata: v.optional(v.object({
            sessionId: v.optional(v.string()),
            reason: v.optional(v.string()),
            attemptsInWindow: v.optional(v.number()),
        })),
    },
    handler: async (ctx, { userId, event, ipAddress, userAgent, metadata }) => {
        const timestamp = Date.now();

        await ctx.db.insert("auditEvents", {
            userId,
            event,
            ipAddress,
            userAgent,
            metadata,
            timestamp,
        });

        return true;
    },
});

/**
 * Get audit log for a specific user
 * For admin dashboard and user self-service
 */
export const getUserAuditLog = query({
    args: {
        userId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { userId, limit }) => {
        const events = await ctx.db
            .query("auditEvents")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .take(limit ?? 50);

        return events;
    },
});

/**
 * Get recent audit events across all users
 * For admin dashboard security overview
 */
export const getRecentAuditEvents = query({
    args: {
        limit: v.optional(v.number()),
        eventType: v.optional(v.union(
            v.literal("sign_in_success"),
            v.literal("sign_in_failure"),
            v.literal("session_created"),
            v.literal("session_revoked"),
            v.literal("all_sessions_revoked"),
            v.literal("rate_limit_exceeded"),
            v.literal("token_verification_failed")
        )),
    },
    handler: async (ctx, { limit, eventType }) => {
        let query = ctx.db.query("auditEvents");

        // Filter by event type if specified
        if (eventType) {
            query = query.withIndex("by_event", (q) => q.eq("event", eventType));
        }

        const events = await query
            .order("desc")
            .take(limit ?? 100);

        return events;
    },
});

/**
 * Get security summary for a user
 * Aggregates recent auth activity for risk assessment
 */
export const getUserSecuritySummary = query({
    args: {
        userId: v.string(),
        hours: v.optional(v.number()), // Lookback period (default 24 hours)
    },
    handler: async (ctx, { userId, hours }) => {
        const lookbackHours = hours ?? 24;
        const cutoff = Date.now() - (lookbackHours * 60 * 60 * 1000);

        const events = await ctx.db
            .query("auditEvents")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .filter((q) => q.gte("timestamp", cutoff))
            .collect();

        // Aggregate statistics
        const summary = {
            totalEvents: events.length,
            successfulSignIns: events.filter(e => e.event === "sign_in_success").length,
            failedSignIns: events.filter(e => e.event === "sign_in_failure").length,
            rateLimitHits: events.filter(e => e.event === "rate_limit_exceeded").length,
            sessionsRevoked: events.filter(e => e.event === "session_revoked").length,
            uniqueIPs: new Set(events.map(e => e.ipAddress).filter(Boolean)).size,
            lastActivity: events.length > 0 ? Math.max(...events.map(e => e.timestamp)) : null,
        };

        return summary;
    },
});

/**
 * Clean up old audit events
 * Run periodically to prevent table bloat
 * Default retention: 90 days
 */
export const cleanupOldAuditEvents = mutation({
    args: {
        retentionDays: v.optional(v.number()),
    },
    handler: async (ctx, { retentionDays }) => {
        const days = retentionDays ?? 90;
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

        // Get old events using timestamp index
        const oldEvents = await ctx.db
            .query("auditEvents")
            .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoff))
            .collect();

        let deletedCount = 0;
        for (const event of oldEvents) {
            await ctx.db.delete(event._id);
            deletedCount++;
        }

        return { deletedCount, retentionDays: days };
    },
});

/**
 * Helper to create consistent audit event logging
 * This can be called from other mutation handlers
 */
export async function createAuditEvent(
    ctx: any,
    params: {
        userId?: string;
        event: AuthEventType;
        ipAddress?: string;
        userAgent?: string;
        metadata?: {
            sessionId?: string;
            reason?: string;
            attemptsInWindow?: number;
        };
    }
): Promise<void> {
    const { userId, event, ipAddress, userAgent, metadata } = params;
    const timestamp = Date.now();

    await ctx.db.insert("auditEvents", {
        userId,
        event,
        ipAddress,
        userAgent,
        metadata,
        timestamp,
    });
}
