/**
 * Razorpay client-side SDK loader and type definitions.
 *
 * The SDK is loaded lazily from Razorpay's CDN only when the user is about to
 * pay, so it doesn't add to the initial bundle or delay page load.
 *
 * NEVER put RAZORPAY_KEY_SECRET here. Only VITE_RAZORPAY_KEY_ID (the
 * publishable key) is safe to expose to the browser.
 */

export type RazorpayCheckoutOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
};

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

export type RazorpayError = {
  error: {
    code: string;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      payment_id?: string;
      subscription_id?: string;
    };
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open(): void;
      on(event: "payment.failed", handler: (response: RazorpayError) => void): void;
    };
  }
}

const RAZORPAY_CDN = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;

/** Lazily injects the Razorpay checkout.js script. Idempotent. */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CDN}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay CDN failed to load")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay CDN failed to load"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/** Returns the Razorpay Key ID from env. Empty string = not configured. */
export function getRazorpayKeyId(): string {
  return (import.meta.env["VITE_RAZORPAY_KEY_ID"] as string | undefined) ?? "";
}

/** True when Razorpay credentials are configured in the environment. */
export function isRazorpayConfigured(): boolean {
  return getRazorpayKeyId().length > 0;
}
