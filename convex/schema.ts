// Convex schema for ShooAuth - Multi-tenant hosted authentication service

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Tenants = apps/customers using the hosted auth service
    tenants: defineTable({
        name: v.string(), // App/company name
        slug: v.string(), // Unique identifier (e.g., "acme-corp")
        ownerId: v.string(), // Shoo userId of the tenant owner
        apiKey: v.string(), // Secret API key for tenant auth
        publicKey: v.string(), // Public identifier
        // Billing
        plan: v.union(
            v.literal("free"),
            v.literal("pro"),
            v.literal("enterprise")
        ),
        stripeCustomerId: v.optional(v.string()),
        stripeSubscriptionId: v.optional(v.string()),
        // Limits
        maxUsers: v.number(), // 100 for free, 1000 for pro, unlimited for enterprise
        maxSessionsPerUser: v.number(), // 5 for free, 10 for pro, unlimited for enterprise
        // Metadata
        allowedOrigins: v.array(v.string()), // CORS origins
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_apiKey", ["apiKey"])
        .index("by_ownerId", ["ownerId"])
        .index("by_stripeCustomerId", ["stripeCustomerId"]),

    // Users are now per-tenant (isolated by tenantId)
    users: defineTable({
        tenantId: v.optional(v.id("tenants")), // Optional during migration
        userId: v.string(), // Shoo userId (pairwise_sub) - unique per tenant
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        createdAt: v.number(),
        lastSeenAt: v.number(),
    })
        .index("by_tenantId", ["tenantId"])
        .index("by_tenantId_userId", ["tenantId", "userId"])
        .index("by_tenantId_email", ["tenantId", "email"]),

    // Sessions are per-tenant
    userSessions: defineTable({
        tenantId: v.optional(v.id("tenants")), // Optional during migration
        userId: v.string(),
        tokenHash: v.string(),
        createdAt: v.number(),
        expiresAt: v.number(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        deviceFingerprint: v.optional(v.string()),
        lastActiveAt: v.number(),
    })
        .index("by_tenantId", ["tenantId"])
        .index("by_tenantId_userId", ["tenantId", "userId"])
        .index("by_tokenHash", ["tokenHash"])
        .index("by_deviceFingerprint", ["deviceFingerprint"]),

    // Rate limiting per tenant (isolated by tenantId)
    rateLimits: defineTable({
        tenantId: v.optional(v.id("tenants")), // Optional during migration
        key: v.string(), // "ip:${ip}:signin" or "user:${userId}:signin"
        count: v.number(),
        windowStart: v.number(),
        expiresAt: v.number(),
    })
        .index("by_tenantId", ["tenantId"])
        .index("by_tenantId_key", ["tenantId", "key"])
        .index("by_expiresAt", ["expiresAt"]),

    // Audit events per tenant
    auditEvents: defineTable({
        tenantId: v.optional(v.id("tenants")), // Optional during migration
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
        .index("by_tenantId", ["tenantId"])
        .index("by_tenantId_userId", ["tenantId", "userId"])
        .index("by_tenantId_timestamp", ["tenantId", "timestamp"])
        .index("by_tenantId_event", ["tenantId", "event"]),

    // Tenant invite system (for team/enterprise plans)
    tenantInvites: defineTable({
        tenantId: v.id("tenants"),
        email: v.string(),
        role: v.union(v.literal("admin"), v.literal("viewer")),
        invitedBy: v.string(), // userId
        token: v.string(), // invite token
        expiresAt: v.number(),
        usedAt: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_tenantId", ["tenantId"])
        .index("by_token", ["token"])
        .index("by_email", ["email"]),

    // Tenant members (multi-user access to dashboard)
    tenantMembers: defineTable({
        tenantId: v.id("tenants"),
        userId: v.string(), // Shoo userId
        role: v.union(v.literal("owner"), v.literal("admin"), v.literal("viewer")),
        joinedAt: v.number(),
    })
        .index("by_tenantId", ["tenantId"])
        .index("by_tenantId_userId", ["tenantId", "userId"])
        .index("by_userId", ["userId"]),
});
