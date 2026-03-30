// Convex functions for user management with Shoo auth

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get current user for personal dashboard (looks across all tenants)
export const getCurrentUserForDashboard = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, { userId }) => {
        // Get all tenants this user belongs to
        const members = await ctx.db
            .query("tenantMembers")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();

        // Find the user record in the first tenant (personal dashboard doesn't need tenant isolation)
        for (const member of members) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_tenantId_userId", (q) =>
                    q.eq("tenantId", member.tenantId).eq("userId", userId)
                )
                .unique();

            if (user) {
                return user;
            }
        }

        return null;
    },
});

// Get current user by their Shoo userId (supports both modes)
export const getCurrentUser = query({
    args: {
        tenantId: v.optional(v.id("tenants")),
        userId: v.string(),
    },
    handler: async (ctx, { tenantId, userId }) => {
        if (tenantId) {
            return await ctx.db
                .query("users")
                .withIndex("by_tenantId_userId", (q) =>
                    q.eq("tenantId", tenantId).eq("userId", userId)
                )
                .unique();
        }
        // Legacy mode
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();
    },
});

// Get or create user (called on sign-in) - supports both legacy and tenant modes
export const getOrCreateUser = mutation({
    args: {
        tenantId: v.optional(v.id("tenants")), // Optional for legacy mode
        userId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, { tenantId, userId, email, name }) => {
        const now = Date.now();

        // LEGACY MODE: No tenant - look up by userId only
        if (!tenantId) {
            const existing = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("userId"), userId))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    lastSeenAt: now,
                    ...(email && { email }),
                    ...(name && { name }),
                });
                return { ...existing, lastSeenAt: now };
            }

            // Create new user without tenant (legacy)
            const userId_doc = await ctx.db.insert("users", {
                userId,
                email,
                name,
                createdAt: now,
                lastSeenAt: now,
            });
            return await ctx.db.get(userId_doc);
        }

        // TENANT MODE: Look up by tenantId + userId
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) throw new Error("Tenant not found");

        const existingUsers = await ctx.db
            .query("users")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
            .collect();

        const existing = await ctx.db
            .query("users")
            .withIndex("by_tenantId_userId", (q) =>
                q.eq("tenantId", tenantId).eq("userId", userId)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastSeenAt: now,
                ...(email && { email }),
                ...(name && { name }),
            });
            return { ...existing, lastSeenAt: now };
        }

        // Check limit before creating
        if (existingUsers.length >= tenant.maxUsers) {
            throw new Error("User limit exceeded for this plan");
        }

        // Create new user in tenant
        const userId_doc = await ctx.db.insert("users", {
            tenantId,
            userId,
            email,
            name,
            createdAt: now,
            lastSeenAt: now,
        });

        return await ctx.db.get(userId_doc);
    },
});

// Update user profile (supports both legacy and tenant modes)
export const updateProfile = mutation({
    args: {
        tenantId: v.optional(v.id("tenants")),
        userId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, { tenantId, userId, email, name }) => {
        let user;

        if (tenantId) {
            // Tenant mode
            user = await ctx.db
                .query("users")
                .withIndex("by_tenantId_userId", (q) =>
                    q.eq("tenantId", tenantId).eq("userId", userId)
                )
                .unique();
        } else {
            // Legacy mode - find first matching user
            user = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("userId"), userId))
                .first();
        }

        if (!user) {
            return false;
        }

        await ctx.db.patch(user._id, {
            ...(email !== undefined && { email }),
            ...(name !== undefined && { name }),
            lastSeenAt: Date.now(),
        });

        return true;
    },
});

// List all users for a tenant (for admin purposes)
export const listUsers = query({
    args: {
        tenantId: v.optional(v.id("tenants")),
    },
    handler: async (ctx, { tenantId }) => {
        if (tenantId) {
            return await ctx.db
                .query("users")
                .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
                .order("desc")
                .take(100);
        }
        // Legacy mode - return all users
        return await ctx.db.query("users").order("desc").take(100);
    },
});

// Get or create user by public key (for tenant mode auth callback)
export const getOrCreateUserByPublicKey = mutation({
    args: {
        publicKey: v.string(),
        userId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, { publicKey, userId, email, name }) => {
        // Look up tenant by public key
        const tenant = await ctx.db
            .query("tenants")
            .filter((q) => q.eq(q.field("publicKey"), publicKey))
            .unique();

        if (!tenant) {
            throw new Error("Tenant not found for public key");
        }

        const tenantId = tenant._id;
        const now = Date.now();

        // Check if user already exists in this tenant
        const existing = await ctx.db
            .query("users")
            .withIndex("by_tenantId_userId", (q) =>
                q.eq("tenantId", tenantId).eq("userId", userId)
            )
            .unique();

        if (existing) {
            // Update existing user
            await ctx.db.patch(existing._id, {
                lastSeenAt: now,
                ...(email && { email }),
                ...(name && { name }),
            });
            return { ...existing, lastSeenAt: now, tenantId };
        }

        // Check user limit before creating
        const existingUsers = await ctx.db
            .query("users")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (existingUsers.length >= tenant.maxUsers) {
            throw new Error("User limit exceeded for this plan");
        }

        // Create new user in tenant
        const userId_doc = await ctx.db.insert("users", {
            tenantId,
            userId,
            email,
            name,
            createdAt: now,
            lastSeenAt: now,
        });

        const newUser = await ctx.db.get(userId_doc);
        return { ...newUser, tenantId };
    },
});
