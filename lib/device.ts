// Device fingerprinting utilities for session security

/**
 * Generate a device fingerprint from IP and User-Agent
 * This creates a privacy-preserving hash that can detect
 * new devices without storing raw PII
 */
export function generateDeviceFingerprint(
    ipAddress: string,
    userAgent: string
): string {
    // Combine IP and User-Agent
    const data = `${ipAddress}:${userAgent}`;

    // Use Web Crypto API for SHA-256 hashing (browser-safe)
    // Note: In Node.js context, use crypto module instead
    if (typeof window !== "undefined" && window.crypto) {
        // Browser context - return a simple hash for now
        // Full implementation would use crypto.subtle.digest
        return simpleHash(data);
    }

    // Node.js context - simple fallback
    return simpleHash(data);
}

/**
 * Simple hash function for device fingerprinting
 * Not cryptographically secure, but sufficient for device detection
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex and take first 16 chars
    const hex = Math.abs(hash).toString(16);
    return hex.padStart(16, "0").slice(0, 16);
}

/**
 * Parse User-Agent to extract device info
 * Returns simplified device type for display
 */
export function parseDeviceInfo(userAgent: string): {
    browser: string;
    os: string;
    device: string;
} {
    const ua = userAgent.toLowerCase();

    // Browser detection
    let browser = "Unknown";
    if (ua.includes("chrome")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari")) browser = "Safari";
    else if (ua.includes("edge")) browser = "Edge";
    else if (ua.includes("opera")) browser = "Opera";

    // OS detection
    let os = "Unknown";
    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac")) os = "macOS";
    else if (ua.includes("linux")) os = "Linux";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

    // Device type
    let device = "Desktop";
    if (ua.includes("mobile")) device = "Mobile";
    else if (ua.includes("tablet")) device = "Tablet";

    return { browser, os, device };
}

/**
 * Format device fingerprint for display
 * Shows first 8 chars with ellipsis
 */
export function formatFingerprint(fingerprint: string): string {
    if (!fingerprint || fingerprint.length < 8) return "Unknown";
    return `${fingerprint.slice(0, 8)}...`;
}

/**
 * Check if a session's device fingerprint matches current device
 * Used to detect new/unrecognized devices
 */
export function isNewDevice(
    currentFingerprint: string,
    knownFingerprints: string[]
): boolean {
    return !knownFingerprints.includes(currentFingerprint);
}
