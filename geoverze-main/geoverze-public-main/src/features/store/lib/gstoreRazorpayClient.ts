/**
 * Razorpay client for Gstore one-time product purchases.
 *
 * This is DIFFERENT from the subscription checkout (pricing/lib/razorpay-client.ts).
 * Gstore uses Razorpay ORDERS (one-time payment), not Subscriptions.
 *
 * API differences:
 *   Subscriptions: open with { subscription_id }
 *   One-time:      open with { order_id }
 *
 * NEVER put RAZORPAY_KEY_SECRET here. Only VITE_RAZORPAY_KEY_ID (the
 * publishable key) is safe to expose to the browser.
 */

export type GstoreRazorpayOptions = {
  key: string;
  /** Razorpay Order ID for the one-time payment (order_xxxx). */
  order_id: string;
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
  handler: (response: GstoreRazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
};

export type GstoreRazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id:   string;
  razorpay_signature:  string;
};

declare global {
  interface Window {
    GstoreRazorpay?: new (options: GstoreRazorpayOptions) => {
      open(): void;
      on(event: "payment.failed", handler: (response: { error: { description: string } }) => void): void;
    };
  }
}

const RAZORPAY_CDN = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

/** Lazily injects the Razorpay checkout.js script. Idempotent. */
export function loadGstoreRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  // The script registers as window.Razorpay regardless of our alias
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
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

/** Returns the Razorpay Key ID from env (build-time). */
export function getGstoreRazorpayKeyId(): string {
  return (import.meta.env["VITE_RAZORPAY_KEY_ID"] as string | undefined) ?? "";
}

/** Opens the Razorpay checkout modal for a one-time Gstore order. */
export function openGstoreRazorpayCheckout(options: GstoreRazorpayOptions): void {
  const RazorpayClass = (window as unknown as { Razorpay: new (o: unknown) => { open(): void; on(e: string, h: unknown): void } }).Razorpay;
  if (!RazorpayClass) throw new Error("Razorpay script not loaded.");
  const rzp = new RazorpayClass(options as unknown);
  if (options.modal?.ondismiss) {
    rzp.on("payment.failed", () => { /* handled by handler */ });
  }
  rzp.open();
}
