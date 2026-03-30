import { createRemoteJWKSet, jwtVerify } from "jose";

const SHOO_BASE_URL = process.env.SHOO_BASE_URL || "https://shoo.dev";
const SHOO_ISSUER = process.env.SHOO_ISSUER || SHOO_BASE_URL;
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";

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

    const idToken = typeof body?.idToken === "string" ? body.idToken : "";
    if (!idToken) {
        return Response.json({ error: "Missing idToken" }, { status: 400 });
    }

    try {
        const audience = `origin:${new URL(APP_ORIGIN).origin}`;
        const { payload } = await jwtVerify(idToken, jwks, {
            issuer: SHOO_ISSUER,
            audience,
        });

        if (typeof payload.pairwise_sub !== "string") {
            return Response.json(
                { error: "Missing pairwise_sub claim" },
                { status: 401 }
            );
        }

        return Response.json({
            userId: payload.pairwise_sub,
            email: payload.email,
            name: payload.name,
        });
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Verification failed";
        return Response.json({ error: message }, { status: 401 });
    }
}
