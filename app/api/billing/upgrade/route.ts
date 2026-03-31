import { type NextRequest, NextResponse } from "next/server";

// Internal API route to handle billing upgrades
// Called by Stripe webhook to update tenant plan

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tenantId, stripeCustomerId, plan } = body;

        if (!tenantId || !plan) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Call Convex action to upgrade tenant
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        const convexAdminKey = process.env.CONVEX_ADMIN_KEY;

        if (!convexUrl) {
            throw new Error("CONVEX_URL not configured");
        }

        // Use Convex HTTP API to call the upgrade mutation
        const response = await fetch(`${convexUrl}/api/mutation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(convexAdminKey && { Authorization: `Bearer ${convexAdminKey}` }),
            },
            body: JSON.stringify({
                path: "billing:upgradeTenant",
                args: {
                    tenantId,
                    plan,
                    stripeCustomerId,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Convex mutation failed: ${error}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Billing upgrade failed:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
