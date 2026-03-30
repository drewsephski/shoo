import { createRemoteJWKSet, jwtVerify } from "jose";

const SHOO_BASE_URL = "https://shoo.dev";
const SHOO_ISSUER = "https://shoo.dev";
const jwks = createRemoteJWKSet(
    new URL("/.well-known/jwks.json", SHOO_BASE_URL),
);

export async function verifyShooToken(idToken: string, appOrigin: string) {
    const audience = `origin:${new URL(appOrigin).origin}`;

    const { payload } = await jwtVerify(idToken, jwks, {
        issuer: SHOO_ISSUER,
        audience,
    });

    if (typeof payload.pairwise_sub !== "string") {
        throw new Error("Shoo token missing pairwise_sub");
    }

    return payload;
}