import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-03-25.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Price ID to plan mapping
const PRICE_TO_PLAN: Record<string, string> = {
    price_1TGjyaIv4Ez9jUN2VrlrduFV: "pro",
    price_1TGjyaIv4Ez9jUN22gRaLWyX: "team",
};

// Call Convex mutation via HTTP API
async function callConvexMutation(path: string, args: Record<string, unknown>) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
        throw new Error("NEXT_PUBLIC_CONVEX_URL not configured");
    }

    const response = await fetch(`${convexUrl}/api/mutation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            path,
            format: "json",
            args,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Convex mutation failed: ${error}`);
    }

    return response.json();
}

export async function POST(request: NextRequest) {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Webhook signature verification failed:", message);
        return NextResponse.json({ error: message }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const tenantId = session.metadata?.tenantId;
            const customerId = session.customer as string;

            if (!tenantId) {
                console.error("No tenantId in session metadata");
                break;
            }

            try {
                // Fetch line items from Stripe to determine which plan was purchased
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                const priceId = lineItems.data[0]?.price?.id;
                const plan = priceId ? PRICE_TO_PLAN[priceId] : null;

                console.log("Webhook debug:", { tenantId, customerId, plan, priceId });

                if (!plan) {
                    console.error("Could not determine plan from session", session.id, "priceId:", priceId);
                    break;
                }

                // Build args carefully to avoid null
                const mutationArgs: Record<string, unknown> = {
                    tenantId,
                    plan,
                };
                if (customerId) {
                    mutationArgs.stripeCustomerId = customerId;
                }

                console.log("Calling Convex with args:", mutationArgs);

                // Call Convex mutation directly
                await callConvexMutation("billing:upgradeTenant", mutationArgs);

                console.log(`Tenant ${tenantId} upgraded to ${plan}`);
            } catch (err) {
                console.error("Failed to process checkout completion:", err);
                // Don't return error - Stripe will retry
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
