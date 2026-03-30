// Stripe billing integration for ShooAuth SaaS

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Stripe Price IDs - replace with your actual IDs from Stripe Dashboard
const STRIPE_PRICE_IDS = {
    pro: "price_1TGhNQIv4Ez9jUN2CBmZMsFu", // $29/month
    enterprise: null, // Contact sales - no self-serve price
};

// Plan configuration
export const PLAN_LIMITS = {
    free: {
        maxUsers: 100,
        maxSessionsPerUser: 5,
        price: 0,
        priceId: null,
        features: ["OAuth sign-in", "Session management", "Basic dashboard"],
    },
    pro: {
        maxUsers: 1000,
        maxSessionsPerUser: 10,
        price: 2900, // $29 in cents
        priceId: STRIPE_PRICE_IDS.pro,
        features: ["Everything in Free", "Audit logs", "Rate limiting", "Priority support"],
    },
    enterprise: {
        maxUsers: -1, // unlimited
        maxSessionsPerUser: -1, // unlimited
        price: null, // contact sales
        priceId: null,
        features: ["Everything in Pro", "Custom SSO", "SLA", "Dedicated support"],
    },
};

// Create Stripe checkout session for plan upgrade
export const createCheckoutSession = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.string(),
        plan: v.union(v.literal("pro"), v.literal("enterprise")),
        successUrl: v.string(),
        cancelUrl: v.string(),
    },
    handler: async (ctx, { tenantId, userId, plan, successUrl, cancelUrl }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) throw new Error("Tenant not found");
        if (tenant.ownerId !== userId) throw new Error("Unauthorized");

        const planConfig = PLAN_LIMITS[plan];
        if (!planConfig.priceId) {
            throw new Error("Enterprise plan requires contact sales");
        }

        // Return checkout configuration for frontend to use with Stripe.js
        return {
            priceId: planConfig.priceId,
            tenantId: tenant._id,
            customerEmail: tenant.ownerId, // Shoo userId as placeholder
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

        const plan = tenant.plan;
        const limits = PLAN_LIMITS[plan];

        return {
            plan,
            limits: {
                maxUsers: limits.maxUsers,
                maxSessionsPerUser: limits.maxSessionsPerUser,
            },
            price: limits.price,
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
