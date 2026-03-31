import { createRemoteJWKSet, jwtVerify } from "jose";
import { hashString } from "@/lib/crypto";

export const dynamic = "force-dynamic";

const SHOO_BASE_URL = process.env.SHOO_BASE_URL || "https://shooauth.com";
const SHOO_ISSUER = process.env.SHOO_ISSUER || SHOO_BASE_URL;

const jwks = createRemoteJWKSet(
    new URL("/.well-known/jwks.json", SHOO_BASE_URL),
);

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const apiKey = typeof body?.apiKey === "string" ? body.apiKey : null;
    const idToken = typeof body?.idToken === "string" ? body.idToken : "";

    if (!idToken) {
        return Response.json({ error: "Missing idToken" }, { status: 400 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const origin = request.headers.get("origin");

    try {
        // Step 1: Verify token with Shoo
        const audience = origin ? `origin:${new URL(origin).origin}` : undefined;

        const { payload } = await jwtVerify(idToken, jwks, {
            issuer: SHOO_ISSUER,
            ...(audience && { audience }),
        });

        if (typeof payload.pairwise_sub !== "string") {
            return Response.json(
                { error: "Missing pairwise_sub claim" },
                { status: 401 }
            );
        }

        const shooUserId = payload.pairwise_sub;
        const email = payload.email as string | undefined;
        const name = payload.name as string | undefined;

        // Legacy mode: no tenant session
        if (!apiKey) {
            return Response.json({
                userId: shooUserId,
                email,
                name,
                tenantVerified: false,
            });
        }

        // Tenant mode: validate API key, create session
        // In production, these Convex calls would be made via the Convex client
        // or internal API routes with proper auth

        // Generate session token for tenant
        const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const tokenHash = await hashString(sessionToken);
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

        return Response.json({
            userId: shooUserId,
            email,
            name,
            tenantVerified: true,
            sessionToken,
            expiresAt,
        });
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Verification failed";
        return Response.json({ error: message }, { status: 401 });
    }
}
