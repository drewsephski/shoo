import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-03-25.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

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
            const subscriptionId = session.subscription as string;

            if (tenantId) {
                // TODO: Call Convex billing.handleStripeWebhook to update tenant
                console.log("Checkout completed:", {
                    tenantId,
                    customerId,
                    subscriptionId,
                });
            }
            break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const tenantId = subscription.metadata?.tenantId;

            if (tenantId) {
                // TODO: Call Convex to update tenant plan based on subscription status
                console.log("Subscription updated/deleted:", {
                    tenantId,
                    status: subscription.status,
                });
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
