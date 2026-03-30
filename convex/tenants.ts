// Tenant management for ShooAuth hosted service

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate secure random token (works in Convex runtime)
async function generateSecureToken(length: number = 32): Promise<string> {
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// Create a new tenant (called when user signs up for ShooAuth)
export const createTenant = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        ownerId: v.string(),
        origin: v.optional(v.string()),
    },
    handler: async (ctx, { name, slug, ownerId, origin }) => {
        // Validate slug format
        if (!/^[a-z0-9-]+$/.test(slug)) {
            throw new Error("Slug must be lowercase alphanumeric with hyphens only");
        }

        // Check for duplicate slug
        const existing = await ctx.db
            .query("tenants")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .unique();
        if (existing) {
            throw new Error("Slug already taken");
        }

        // Generate API keys
        const apiKey = `shoo_${await generateSecureToken(32)}`;
        const publicKey = `pk_${await generateSecureToken(16)}`;

        const now = Date.now();

        // Create tenant with free plan defaults
        const tenantId = await ctx.db.insert("tenants", {
            name,
            slug,
            ownerId,
            apiKey,
            publicKey,
            plan: "free",
            maxUsers: 100,
            maxSessionsPerUser: 5,
            allowedOrigins: origin ? [origin] : [],
            createdAt: now,
            updatedAt: now,
        });

        // Add owner as tenant member
        await ctx.db.insert("tenantMembers", {
            tenantId,
            userId: ownerId,
            role: "owner",
            joinedAt: now,
        });

        return { tenantId, apiKey, publicKey };
    },
});

// Get tenant by API key (used for API authentication)
export const getTenantByApiKey = query({
    args: { apiKey: v.string() },
    handler: async (ctx, { apiKey }) => {
        return await ctx.db
            .query("tenants")
            .withIndex("by_apiKey", (q) => q.eq("apiKey", apiKey))
            .unique();
    },
});

// Get tenant by public key (safe for client-side)
export const getTenantByPublicKey = query({
    args: { publicKey: v.string() },
    handler: async (ctx, { publicKey }) => {
        const tenant = await ctx.db
            .query("tenants")
            .filter((q) => q.eq(q.field("publicKey"), publicKey))
            .unique();

        if (!tenant) return null;

        // Return only safe fields
        return {
            _id: tenant._id,
            name: tenant.name,
            slug: tenant.slug,
            publicKey: tenant.publicKey,
            plan: tenant.plan,
            allowedOrigins: tenant.allowedOrigins,
        };
    },
});

// Get tenant for owner (full access)
export const getTenantForOwner = query({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
    },
    handler: async (ctx, { tenantId, userId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant || tenant.ownerId !== userId) {
            return null;
        }
        return tenant;
    },
});

// List all tenants for a user
export const getUserTenants = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const members = await ctx.db
            .query("tenantMembers")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        const tenants = [];
        for (const member of members) {
            const tenant = await ctx.db.get(member.tenantId);
            if (tenant) {
                tenants.push({
                    ...tenant,
                    memberRole: member.role,
                });
            }
        }

        return tenants;
    },
});

// Update tenant settings
export const updateTenant = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
        updates: v.object({
            name: v.optional(v.string()),
            allowedOrigins: v.optional(v.array(v.string())),
        }),
    },
    handler: async (ctx, { tenantId, userId, updates }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) throw new Error("Tenant not found");

        // Check permissions
        const member = await ctx.db
            .query("tenantMembers")
            .withIndex("by_tenantId_userId", (q) =>
                q.eq("tenantId", tenantId).eq("userId", userId)
            )
            .unique();

        if (!member || (member.role !== "owner" && member.role !== "admin")) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(tenantId, {
            ...updates,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Regenerate API key (security rotation)
export const regenerateApiKey = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
    },
    handler: async (ctx, { tenantId, userId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant || tenant.ownerId !== userId) {
            throw new Error("Unauthorized");
        }

        const newApiKey = `shoo_${await generateSecureToken(32)}`;

        await ctx.db.patch(tenantId, {
            apiKey: newApiKey,
            updatedAt: Date.now(),
        });

        return { apiKey: newApiKey };
    },
});

// Get tenant stats (for dashboard)
export const getTenantStats = query({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
    },
    handler: async (ctx, { tenantId, userId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) return null;

        // Check membership
        const member = await ctx.db
            .query("tenantMembers")
            .withIndex("by_tenantId_userId", (q) =>
                q.eq("tenantId", tenantId).eq("userId", userId)
            )
            .unique();

        if (!member) return null;

        // Count users
        const users = await ctx.db
            .query("users")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
            .collect();

        // Count active sessions
        const sessions = await ctx.db
            .query("userSessions")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
            .collect();

        const now = Date.now();
        const activeSessions = sessions.filter((s) => s.expiresAt > now);

        // Recent audit events
        const recentEvents = await ctx.db
            .query("auditEvents")
            .withIndex("by_tenantId_timestamp", (q) =>
                q.eq("tenantId", tenantId)
            )
            .order("desc")
            .take(100);

        return {
            userCount: users.length,
            maxUsers: tenant.maxUsers,
            sessionCount: activeSessions.length,
            totalSessions: sessions.length,
            maxSessionsPerUser: tenant.maxSessionsPerUser,
            recentEvents: recentEvents.length,
            plan: tenant.plan,
        };
    },
});
