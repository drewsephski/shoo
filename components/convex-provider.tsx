"use client";

import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexProviderWithShoo({ children }: { children: ReactNode }) {
    // Use regular ConvexProvider since Shoo manages auth separately
    // Convex queries/mutations will use the userId passed from client, verified server-side
    return (
        <ConvexProvider client={convex}>
            {children}
        </ConvexProvider>
    );
}
