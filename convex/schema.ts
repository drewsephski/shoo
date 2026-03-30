// Convex schema for user data with Shoo authentication

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        userId: v.string(), // Shoo userId (pairwise_sub)
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        createdAt: v.number(), // Unix timestamp
        lastSeenAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_email", ["email"]),

    userSessions: defineTable({
        userId: v.string(),
        tokenHash: v.string(), // Hash of the token for verification
        createdAt: v.number(),
        expiresAt: v.number(),
        // Device metadata for security tracking
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        deviceFingerprint: v.optional(v.string()), // hash of UA + IP
        lastActiveAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_tokenHash", ["tokenHash"])
        .index("by_deviceFingerprint", ["deviceFingerprint"]),

    // Rate limiting table
    rateLimits: defineTable({
        key: v.string(), // "ip:${ip}:signin" or "user:${userId}:signin"
        count: v.number(), // attempts in current window
        windowStart: v.number(), // timestamp (ms) when window started
        expiresAt: v.number(), // TTL for automatic cleanup
    })
        .index("by_key", ["key"])
        .index("by_expiresAt", ["expiresAt"]),

    // Audit logging table
    auditEvents: defineTable({
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
        timestamp: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_timestamp", ["timestamp"])
        .index("by_event", ["event"]),
});
