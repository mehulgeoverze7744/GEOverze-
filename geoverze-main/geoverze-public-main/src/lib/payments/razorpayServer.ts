/**
 * Server-only Razorpay REST helpers.
 * Never import this module from client components — it reads Key Secret.
 */

import {
  assertCapturedPayment,
  verifyRazorpayOrderSignature,
  verifyRazorpaySubscriptionSignature,
} from "./razorpayCrypto";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function usableSecret(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  const lowered = trimmed.toLowerCase();
  if (
    lowered === "your_webhook_secret" ||
    lowered === "whsec_xxxx" ||
    lowered === "changeme" ||
    lowered === "placeholder"
  ) {
    return "";
  }
  return trimmed;
}

export function getRazorpayKeyId(): string {
  return (
    process.env["RAZORPAY_KEY_ID"] ??
    process.env["VITE_RAZORPAY_KEY_ID"] ??
    process.env["NEXT_PUBLIC_RAZORPAY_KEY_ID"] ??
    ""
  ).trim();
}

export function getRazorpayKeySecret(): string {
  return usableSecret(process.env["RAZORPAY_KEY_SECRET"]);
}

export function getRazorpayWebhookSecret(): string {
  return usableSecret(process.env["RAZORPAY_WEBHOOK_SECRET"]);
}

export function getRazorpayMode(): "test" | "live" {
  const explicit = (process.env["RAZORPAY_MODE"] ?? "").toLowerCase();
  if (explicit === "live") return "live";
  if (explicit === "test") return "test";
  return getRazorpayKeyId().startsWith("rzp_live_") ? "live" : "test";
}

export function isRazorpayServerConfigured(): boolean {
  return getRazorpayKeyId().length > 0 && getRazorpayKeySecret().length > 0;
}

function basicAuthHeader(): string {
  return `Basic ${Buffer.from(`${getRazorpayKeyId()}:${getRazorpayKeySecret()}`).toString("base64")}`;
}

function assertKeysMatchMode(): void {
  const keyId = getRazorpayKeyId();
  const mode = getRazorpayMode();
  if (mode !== "live" && keyId.startsWith("rzp_live_")) {
    throw new Error("Live Razorpay keys cannot be used while RAZORPAY_MODE=test.");
  }
}

async function razorpayRequest<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T> {
  if (!isRazorpayServerConfigured()) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  assertKeysMatchMode();
  const res = await fetch(`${RAZORPAY_API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuthHeader(),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay API error (${res.status}): ${err}`);
  }
  return res.json() as Promise<T>;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
};

export type RazorpayPayment = {
  id: string;
  order_id?: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
  method?: string;
  notes?: Record<string, string>;
};

export type RazorpayPlan = {
  id: string;
  period: string;
  interval: number;
  item: { name: string; amount: number; currency: string };
};

export type RazorpaySubscription = {
  id: string;
  plan_id: string;
  status: string;
  current_start?: number;
  current_end?: number;
  charge_at?: number;
};

export async function createRazorpayOrder(input: {
  amountMinor: number;
  currency?: string;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>("POST", "/orders", {
    amount: input.amountMinor,
    currency: input.currency ?? "INR",
    receipt: input.receipt.slice(0, 40),
    payment_capture: 1,
    notes: input.notes,
  });
}

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  return razorpayRequest<RazorpayPayment>("GET", `/payments/${paymentId}`);
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>("GET", `/orders/${orderId}`);
}

export async function createRazorpayPlan(input: {
  period: "monthly" | "yearly";
  interval: number;
  name: string;
  amountMinor: number;
}): Promise<RazorpayPlan> {
  return razorpayRequest<RazorpayPlan>("POST", "/plans", {
    period: input.period,
    interval: input.interval,
    item: {
      name: input.name,
      amount: input.amountMinor,
      currency: "INR",
    },
  });
}

export async function createRazorpaySubscription(input: {
  planId: string;
  totalCount: number;
  notes: Record<string, string>;
  customerNotify?: boolean;
}): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>("POST", "/subscriptions", {
    plan_id: input.planId,
    total_count: input.totalCount,
    quantity: 1,
    customer_notify: input.customerNotify === false ? 0 : 1,
    notes: input.notes,
  });
}

export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd = true,
): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>(
    "POST",
    `/subscriptions/${subscriptionId}/cancel`,
    { cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 },
  );
}

export async function verifyCapturedOrderPayment(input: {
  rzpOrderId: string;
  rzpPaymentId: string;
  rzpSignature: string;
  expectedAmountMinor: number;
  expectedCurrency?: string;
}): Promise<RazorpayPayment> {
  const secret = getRazorpayKeySecret();
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  const signed = verifyRazorpayOrderSignature({
    keySecret: secret,
    razorpayOrderId: input.rzpOrderId,
    razorpayPaymentId: input.rzpPaymentId,
    razorpaySignature: input.rzpSignature,
  });
  if (!signed) {
    throw new Error("Payment signature verification failed. Do not trust this payment.");
  }
  const payment = await fetchRazorpayPayment(input.rzpPaymentId);
  const check = assertCapturedPayment(
    {
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      orderId: payment.order_id ?? null,
      captured: payment.captured,
    },
    {
      amountMinor: input.expectedAmountMinor,
      currency: input.expectedCurrency ?? "INR",
      orderId: input.rzpOrderId,
    },
  );
  if (!check.ok) throw new Error(check.message);
  return payment;
}

export async function verifyCapturedSubscriptionPayment(input: {
  rzpSubscriptionId: string;
  rzpPaymentId: string;
  rzpSignature: string;
}): Promise<RazorpayPayment> {
  const secret = getRazorpayKeySecret();
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  const signed = verifyRazorpaySubscriptionSignature({
    keySecret: secret,
    razorpayPaymentId: input.rzpPaymentId,
    razorpaySubscriptionId: input.rzpSubscriptionId,
    razorpaySignature: input.rzpSignature,
  });
  if (!signed) {
    throw new Error("Subscription payment signature verification failed.");
  }
  const payment = await fetchRazorpayPayment(input.rzpPaymentId);
  if (payment.status !== "captured" && !payment.captured) {
    throw new Error(`Subscription payment is not captured (status=${payment.status}).`);
  }
  if (payment.subscription_id && payment.subscription_id !== input.rzpSubscriptionId) {
    throw new Error("Subscription payment does not match the Razorpay subscription.");
  }
  return payment;
}

export function envPlanId(tier: string, interval: string): string {
  const key = `RAZORPAY_PLAN_${tier.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[key] ?? "";
}
