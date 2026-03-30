// Convex functions for user management with Shoo auth

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get current user by their Shoo userId
export const getCurrentUser = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();
    },
});

// Get or create user (called on sign-in)
export const getOrCreateUser = mutation({
    args: {
        userId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, { userId, email, name }) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        const now = Date.now();

        if (existing) {
            // Update last seen
            await ctx.db.patch(existing._id, {
                lastSeenAt: now,
                ...(email && { email }),
                ...(name && { name }),
            });
            return { ...existing, lastSeenAt: now };
        }

        // Create new user
        const userId_doc = await ctx.db.insert("users", {
            userId,
            email,
            name,
            createdAt: now,
            lastSeenAt: now,
        });

        return await ctx.db.get(userId_doc);
    },
});

// Update user profile
export const updateProfile = mutation({
    args: {
        userId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, { userId, email, name }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

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

// List all users (for admin purposes)
export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").order("desc").take(100);
    },
});
