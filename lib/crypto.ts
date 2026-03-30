// Crypto utilities for secure token generation

/**
 * Generate a cryptographically secure random token
 * @param length Length of the token in bytes (output will be hex string, so 2x length)
 * @returns Hex-encoded random string
 */
export async function generateSecureToken(length: number = 32): Promise<string> {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Hash a string using SHA-256
 * @param data String to hash
 * @returns Hex-encoded hash (first 16 chars for brevity)
 */
export async function hashString(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return hashHex.slice(0, 16); // Truncate for storage efficiency
}

/**
 * Generate a device fingerprint from IP and user agent
 */
export async function generateDeviceFingerprint(
    ipAddress: string,
    userAgent: string
): Promise<string> {
    const data = `${ipAddress}:${userAgent}`;
    return hashString(data);
}
