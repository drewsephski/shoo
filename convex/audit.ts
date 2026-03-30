// Convex audit logging for authentication events - Multi-tenant

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { GenericMutationCtx } from "convex/server";

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
 * Log an authentication event (tenant isolated)
 */
export const logAuthEvent = mutation({
    args: {
        tenantId: v.id("tenants"),
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
    handler: async (ctx, { tenantId, userId, event, ipAddress, userAgent, metadata }) => {
        await ctx.db.insert("auditEvents", {
            tenantId,
            userId,
            event,
            ipAddress,
            userAgent,
            metadata,
            timestamp: Date.now(),
        });
        return true;
    },
});

/**
 * Get audit log for a specific user (tenant isolated)
 */
export const getUserAuditLog = query({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, userId, limit }) => {
        const events = await ctx.db
            .query("auditEvents")
            .withIndex("by_tenantId_userId", (q) =>
                q.eq("tenantId", tenantId).eq("userId", userId)
            )
            .order("desc")
            .take(limit ?? 50);

        return events;
    },
});

/**
 * Get recent audit events for a tenant
 */
export const getRecentAuditEvents = query({
    args: {
        tenantId: v.id("tenants"),
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
    handler: async (ctx, { tenantId, limit, eventType }) => {
        let events;

        if (eventType) {
            events = await ctx.db
                .query("auditEvents")
                .withIndex("by_tenantId_event", (q) =>
                    q.eq("tenantId", tenantId).eq("event", eventType)
                )
                .order("desc")
                .take(limit ?? 100);
        } else {
            events = await ctx.db
                .query("auditEvents")
                .withIndex("by_tenantId_timestamp", (q) => q.eq("tenantId", tenantId))
                .order("desc")
                .take(limit ?? 100);
        }

        return events;
    },
});

/**
 * Get security summary for a user (tenant isolated)
 */
export const getUserSecuritySummary = query({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
        hours: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, userId, hours }) => {
        const lookbackHours = hours ?? 24;
        const cutoff = Date.now() - (lookbackHours * 60 * 60 * 1000);

        const events = await ctx.db
            .query("auditEvents")
            .withIndex("by_tenantId_userId", (q) =>
                q.eq("tenantId", tenantId).eq("userId", userId)
            )
            .filter((q) => q.gte(q.field("timestamp"), cutoff))
            .collect();

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
 * Clean up old audit events (tenant isolated)
 */
export const cleanupOldAuditEvents = mutation({
    args: {
        tenantId: v.id("tenants"),
        retentionDays: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, retentionDays }) => {
        const days = retentionDays ?? 90;
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

        const oldEvents = await ctx.db
            .query("auditEvents")
            .withIndex("by_tenantId_timestamp", (q) => q.eq("tenantId", tenantId))
            .filter((q) => q.lt(q.field("timestamp"), cutoff))
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
    ctx: GenericMutationCtx<any>,
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
