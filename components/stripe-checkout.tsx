"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

// Load Stripe outside of component to avoid recreating it
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

interface StripeCheckoutButtonProps {
    priceId: string;
    tenantId: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    children: React.ReactNode;
    className?: string;
}

export function StripeCheckoutButton({
    priceId,
    tenantId,
    customerEmail,
    successUrl,
    cancelUrl,
    children,
    className = "",
}: StripeCheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        const stripe = await stripePromise;
        if (!stripe) {
            alert("Stripe not configured");
            return;
        }

        setIsLoading(true);

        try {
            // Create checkout session via your API route
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId,
                    tenantId,
                    customerEmail,
                    successUrl,
                    cancelUrl,
                }),
            });

            const { url, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

            // Redirect to Stripe Checkout
            window.location.href = url;
        } catch (err) {
            console.error("Checkout failed:", err);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? "Loading..." : children}
        </button>
    );
}
