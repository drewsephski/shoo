// Convex rate limiting for authentication endpoints - Multi-tenant

import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Default rate limit configuration
const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_REQUESTS = 5; // 5 attempts per window

interface RateLimitCheckArgs {
    tenantId: Id<"tenants">;
    key: string;
    windowMs?: number;
    maxRequests?: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Core rate limit check logic (can be called from other queries)
 */
async function checkRateLimitCore(
    ctx: QueryCtx,
    { tenantId, key, windowMs, maxRequests }: RateLimitCheckArgs
): Promise<RateLimitResult> {
    const window = windowMs ?? DEFAULT_WINDOW_MS;
    const max = maxRequests ?? DEFAULT_MAX_REQUESTS;
    const now = Date.now();

    // Find existing rate limit record (tenant-scoped)
    const existing = await ctx.db
        .query("rateLimits")
        .withIndex("by_tenantId_key", (q) => q.eq("tenantId", tenantId).eq("key", key))
        .unique();

    if (!existing) {
        return {
            allowed: true,
            remaining: max - 1,
            resetAt: now + window,
        };
    }

    // Check if window has expired
    if (now - existing.windowStart > window) {
        return {
            allowed: true,
            remaining: max - 1,
            resetAt: now + window,
        };
    }

    // Check if under limit
    const allowed = existing.count < max;
    const remaining = Math.max(0, max - existing.count);

    return {
        allowed,
        remaining,
        resetAt: existing.windowStart + window,
    };
}

/**
 * Check if a request is within rate limits (tenant isolated)
 * Returns { allowed, remaining, resetAt }
 */
export const checkRateLimit = query({
    args: {
        tenantId: v.id("tenants"),
        key: v.string(), // e.g., "ip:192.168.1.1:signin"
        windowMs: v.optional(v.number()),
        maxRequests: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, key, windowMs, maxRequests }) => {
        return await checkRateLimitCore(ctx, { tenantId, key, windowMs, maxRequests });
    },
});

/**
 * Increment rate limit counter for a key (tenant isolated)
 */
export const incrementRateLimit = mutation({
    args: {
        tenantId: v.id("tenants"),
        key: v.string(),
        windowMs: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, key, windowMs }) => {
        const window = windowMs ?? DEFAULT_WINDOW_MS;
        const now = Date.now();

        const existing = await ctx.db
            .query("rateLimits")
            .withIndex("by_tenantId_key", (q) => q.eq("tenantId", tenantId).eq("key", key))
            .unique();

        if (!existing || now - existing.windowStart > window) {
            // Create new window
            const expiresAt = now + window * 2;
            await ctx.db.insert("rateLimits", {
                tenantId,
                key,
                count: 1,
                windowStart: now,
                expiresAt,
            });
        } else {
            // Increment existing counter
            await ctx.db.patch(existing._id, {
                count: existing.count + 1,
            });
        }
    },
});

/**
 * Clean up expired rate limit records (tenant isolated)
 */
export const cleanupExpiredRateLimits = mutation({
    args: {
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { tenantId }) => {
        const now = Date.now();

        const expired = await ctx.db
            .query("rateLimits")
            .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
            .filter((q) => q.eq(q.field("tenantId"), tenantId))
            .collect();

        let deletedCount = 0;
        for (const record of expired) {
            await ctx.db.delete(record._id);
            deletedCount++;
        }

        return { deletedCount };
    },
});

/**
 * Helper to generate rate limit keys
 */
export function createRateLimitKey(
    type: "ip" | "user",
    identifier: string,
    action: string
): string {
    return `${type}:${identifier}:${action}`;
}

/**
 * Convenience: Check sign-in rate limit for IP (tenant scoped)
 */
export const checkSignInRateLimit = query({
    args: {
        tenantId: v.id("tenants"),
        ipAddress: v.string(),
    },
    handler: async (ctx, { tenantId, ipAddress }) => {
        const key = createRateLimitKey("ip", ipAddress, "signin");
        return await checkRateLimitCore(ctx, { tenantId, key });
    },
});
