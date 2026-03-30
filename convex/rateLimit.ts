// Convex rate limiting for authentication endpoints

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Default rate limit configuration
const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_REQUESTS = 5; // 5 attempts per window

/**
 * Check if a request is within rate limits
 * Returns { allowed, remaining, resetAt }
 */
export const checkRateLimit = query({
    args: {
        key: v.string(), // e.g., "ip:192.168.1.1:signin"
        windowMs: v.optional(v.number()),
        maxRequests: v.optional(v.number()),
    },
    handler: async (ctx, { key, windowMs, maxRequests }) => {
        const window = windowMs ?? DEFAULT_WINDOW_MS;
        const max = maxRequests ?? DEFAULT_MAX_REQUESTS;
        const now = Date.now();

        // Find existing rate limit record
        const existing = await ctx.db
            .query("rateLimits")
            .withIndex("by_key", (q) => q.eq("key", key))
            .unique();

        if (!existing) {
            // No record exists - request is allowed
            return {
                allowed: true,
                remaining: max - 1,
                resetAt: now + window,
            };
        }

        // Check if window has expired
        if (now - existing.windowStart > window) {
            // Window expired - reset counter
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
    },
});

/**
 * Increment rate limit counter for a key
 * Call this after a rate-limited operation (whether successful or not)
 */
export const incrementRateLimit = mutation({
    args: {
        key: v.string(),
        windowMs: v.optional(v.number()),
    },
    handler: async (ctx, { key, windowMs }) => {
        const window = windowMs ?? DEFAULT_WINDOW_MS;
        const now = Date.now();

        // Find existing record
        const existing = await ctx.db
            .query("rateLimits")
            .withIndex("by_key", (q) => q.eq("key", key))
            .unique();

        if (!existing || now - existing.windowStart > window) {
            // Create new window
            const expiresAt = now + window * 2; // Give buffer for cleanup
            await ctx.db.insert("rateLimits", {
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
 * Clean up expired rate limit records
 * Should be run periodically (e.g., via cron job or scheduled function)
 */
export const cleanupExpiredRateLimits = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        // Find expired records using the expiresAt index
        const expired = await ctx.db
            .query("rateLimits")
            .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
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
