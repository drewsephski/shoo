// Stripe billing integration for ShooAuth SaaS

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Plan configuration — One-time template purchase model
// All tiers include full production features (rate limiting, audit logs, device fingerprinting)
// Price is one-time for template + updates access
export const PLAN_LIMITS = {
    free: {
        maxUsers: -1, // unlimited
        maxSessionsPerUser: -1, // unlimited
        price: 0,
        stripePriceId: "", // No price for free plan
        priceLabel: "Free",
        description: "Self-hosted, community support",
        features: [
            "Full source code",
            "OAuth + session management",
            "Rate limiting",
            "Audit logs",
            "Device fingerprinting",
            "Admin dashboard",
            "Community Discord",
        ],
    },
    pro: {
        maxUsers: -1, // unlimited
        maxSessionsPerUser: -1, // unlimited
        price: 7900, // $79 one-time
        stripePriceId: "price_1TGjyaIv4Ez9jUN2VrlrduFV", // $79 one-time
        priceLabel: "$79 one-time",
        description: "Template + 1 year of updates",
        features: [
            "Everything in Free",
            "1 year of updates",
            "Priority Discord support",
            "Video setup guide",
        ],
    },
    team: {
        maxUsers: -1, // unlimited
        maxSessionsPerUser: -1, // unlimited
        price: 29900, // $299 one-time
        stripePriceId: "price_1TGjyaIv4Ez9jUN22gRaLWyX", // $299 one-time
        priceLabel: "$299 one-time",
        description: "Full package + implementation help",
        features: [
            "Everything in Pro",
            "Lifetime updates",
            "1:1 code review call (30 min)",
            "Email support (30 days)",
            "Custom implementation guidance",
        ],
    },
};

// Type for plan IDs
type PlanId = keyof typeof PLAN_LIMITS;

// Create Stripe checkout session for plan upgrade
export const createCheckoutSession = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
        plan: v.union(v.literal("pro"), v.literal("team")),
        successUrl: v.string(),
        cancelUrl: v.string(),
    },
    handler: async (ctx, { tenantId, userId, plan, successUrl, cancelUrl }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) throw new Error("Tenant not found");
        if (tenant.ownerId !== userId) throw new Error("Unauthorized");

        const planConfig = PLAN_LIMITS[plan as PlanId];
        if (!planConfig.price || planConfig.price === 0) {
            throw new Error("Team plan checkout requires manual setup - contact sales");
        }

        // Return checkout configuration for frontend
        return {
            plan,
            priceId: planConfig.stripePriceId,
            tenantId: tenant._id,
            customerEmail: tenant.ownerId,
            successUrl,
            cancelUrl,
        };
    },
});

// Handle Stripe webhook for subscription events
export const handleStripeWebhook = mutation({
    args: {
        event: v.object({
            type: v.string(),
            data: v.any(),
        }),
    },
    handler: async (ctx, { event }) => {
        const { type, data } = event;

        switch (type) {
            case "checkout.session.completed": {
                const customerId = data.object.customer;
                const subscriptionId = data.object.subscription;

                // Find tenant by Stripe customer ID
                const tenant = await ctx.db
                    .query("tenants")
                    .withIndex("by_stripeCustomerId", (q) =>
                        q.eq("stripeCustomerId", customerId)
                    )
                    .unique();

                if (tenant) {
                    // Determine plan from line items (mock for now)
                    const plan = "pro";
                    const limits = PLAN_LIMITS[plan];

                    await ctx.db.patch(tenant._id, {
                        plan,
                        stripeSubscriptionId: subscriptionId,
                        maxUsers: limits.maxUsers,
                        maxSessionsPerUser: limits.maxSessionsPerUser,
                        updatedAt: Date.now(),
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscriptionId = data.object.id;

                // Find tenant by subscription ID
                const tenant = await ctx.db
                    .query("tenants")
                    .filter((q) => q.eq(q.field("stripeSubscriptionId"), subscriptionId))
                    .unique();

                if (tenant) {
                    // Revert to free plan
                    await ctx.db.patch(tenant._id, {
                        plan: "free",
                        stripeSubscriptionId: undefined,
                        maxUsers: PLAN_LIMITS.free.maxUsers,
                        maxSessionsPerUser: PLAN_LIMITS.free.maxSessionsPerUser,
                        updatedAt: Date.now(),
                    });
                }
                break;
            }
        }

        return { success: true };
    },
});

// Get billing portal URL for customer
export const createBillingPortalSession = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
        returnUrl: v.string(),
    },
    handler: async (ctx, { tenantId, userId, returnUrl }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) throw new Error("Tenant not found");
        if (tenant.ownerId !== userId) throw new Error("Unauthorized");
        if (!tenant.stripeCustomerId) throw new Error("No billing setup");

        // Return configuration for Stripe billing portal
        return {
            customerId: tenant.stripeCustomerId,
            returnUrl,
        };
    },
});

// Get current plan details
export const getPlanDetails = query({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
    },
    handler: async (ctx, { tenantId, userId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) return null;

        // Verify membership
        const member = await ctx.db
            .query("tenantMembers")
            .withIndex("by_tenantId_userId", (q) =>
                q.eq("tenantId", tenantId).eq("userId", userId)
            )
            .unique();

        if (!member) return null;

        const plan = tenant.plan as PlanId;
        const limits = PLAN_LIMITS[plan];

        return {
            plan,
            limits: {
                maxUsers: limits.maxUsers,
                maxSessionsPerUser: limits.maxSessionsPerUser,
            },
            priceId: limits.stripePriceId,
            price: limits.price,
            priceLabel: limits.priceLabel,
            description: limits.description,
            features: limits.features,
            stripeSubscriptionId: tenant.stripeSubscriptionId,
        };
    },
});

// Check if user limit would be exceeded
export const checkUserLimit = query({
    args: {
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { tenantId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) throw new Error("Tenant not found");

        const users = await ctx.db
            .query("users")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
            .collect();

        return {
            current: users.length,
            max: tenant.maxUsers,
            canAdd: tenant.maxUsers === -1 || users.length < tenant.maxUsers,
        };
    },
});

// Upgrade tenant plan after successful checkout (one-time purchase)
export const upgradeTenant = mutation({
    args: {
        tenantId: v.id("tenants"),
        plan: v.union(v.literal("pro"), v.literal("team")),
        stripeCustomerId: v.optional(v.string()),
    },
    handler: async (ctx, { tenantId, plan, stripeCustomerId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) throw new Error("Tenant not found");

        const limits = PLAN_LIMITS[plan as PlanId];

        // Update tenant with new plan
        await ctx.db.patch(tenantId, {
            plan,
            maxUsers: limits.maxUsers,
            maxSessionsPerUser: limits.maxSessionsPerUser,
            ...(stripeCustomerId && { stripeCustomerId }),
            updatedAt: Date.now(),
        });

        return { success: true, plan };
    },
});
