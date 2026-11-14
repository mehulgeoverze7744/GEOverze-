/**
 * Razorpay Standard Checkout payment-method config for Gstore.
 *
 * Does not hide UPI. Requests UPI Intent (mobile) and UPI QR (desktop)
 * alongside cards, netbanking and wallets. Does not use UPI Collect.
 *
 * Checkout.js can only display methods that are enabled on the Razorpay
 * account. If UPI is off in Dashboard → Account & Settings → Payment
 * Methods, this config cannot turn it on.
 */

export const GSTORE_RAZORPAY_ALLOWED_METHODS = {
  upi: true,
  card: true,
  netbanking: true,
  wallet: true,
} as const;

export const GSTORE_RAZORPAY_DISPLAY_CONFIG = {
  display: {
    blocks: {
      upi: {
        name: "UPI",
        instruments: [
          {
            method: "upi",
            flows: ["intent", "qr"],
          },
        ],
      },
    },
    sequence: ["block.upi", "card", "netbanking", "wallet"],
    preferences: {
      show_default_blocks: true,
    },
  },
} as const;

export function gstoreRazorpayCheckoutExtras() {
  return {
    currency: "INR" as const,
    method: GSTORE_RAZORPAY_ALLOWED_METHODS,
    config: GSTORE_RAZORPAY_DISPLAY_CONFIG,
  };
}

export function gstoreCheckoutHidesUpi(): boolean {
  const hide = (GSTORE_RAZORPAY_DISPLAY_CONFIG.display as { hide?: Array<{ method?: string }> }).hide;
  if (Array.isArray(hide) && hide.some((item) => item.method === "upi")) return true;
  return GSTORE_RAZORPAY_ALLOWED_METHODS.upi !== true;
}

export function gstoreUpiFlows(): readonly string[] {
  return GSTORE_RAZORPAY_DISPLAY_CONFIG.display.blocks.upi.instruments[0]?.flows ?? [];
}
