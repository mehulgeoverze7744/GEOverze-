/**
 * Server-only Razorpay REST helpers.
 * Never import this module from client components — it reads Key Secret.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import "@tanstack/react-start/server-only";
import {
  assertCapturedPayment,
  verifyRazorpayOrderSignature,
  verifyRazorpaySubscriptionSignature,
} from "./razorpayCrypto";
import {
  classifyRazorpayKeyPrefix,
  encodeRazorpayBasicAuth,
  formatRazorpayHttpError,
  razorpayKeyFingerprint,
  resolveRazorpayCredentialPair,
  secretLooksLikeKeyId,
  stripEnvValue,
  usableRazorpaySecret,
  type RazorpayCredentialPair,
  type RazorpayKeyPrefix,
} from "./razorpayCredentialParse";

const RAZORPAY_API = "https://api.razorpay.com/v1";

/** Dynamic lookup so Nitro/Vite cannot inline a stale build-time secret. */
function readRuntimeEnv(name: string): string {
  const runtime = globalThis as {
    process?: { env?: Record<string, string | undefined> };
  };
  return stripEnvValue(runtime.process?.env?.[name]);
}

function allowDotEnvLocal(): boolean {
  const vercel = readRuntimeEnv("VERCEL").toLowerCase();
  if (vercel === "1" || vercel === "true") return false;
  if (readRuntimeEnv("NODE_ENV") === "production") return false;
  return true;
}

function readDotEnvLocal(name: string): string {
  if (!allowDotEnvLocal()) return "";
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      if (trimmed.slice(0, eq).trim() === name) {
        return stripEnvValue(trimmed.slice(eq + 1));
      }
    }
  } catch {
    // Production/Vercel has no .env.local — fall through to process.env.
  }
  return "";
}

function readCredentialPair(): RazorpayCredentialPair {
  return resolveRazorpayCredentialPair({
    allowLocal: allowDotEnvLocal(),
    localKeyId: readDotEnvLocal("RAZORPAY_KEY_ID") || readDotEnvLocal("VITE_RAZORPAY_KEY_ID"),
    localKeySecret: readDotEnvLocal("RAZORPAY_KEY_SECRET"),
    runtimeKeyId:
      readRuntimeEnv("RAZORPAY_KEY_ID") ||
      readRuntimeEnv("VITE_RAZORPAY_KEY_ID") ||
      readRuntimeEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID"),
    runtimeKeySecret: readRuntimeEnv("RAZORPAY_KEY_SECRET"),
  });
}

export function getRazorpayKeyId(): string {
  return readCredentialPair().keyId;
}

export function getRazorpayKeySecret(): string {
  return usableRazorpaySecret(readCredentialPair().keySecret);
}

export function getRazorpayWebhookSecret(): string {
  return usableRazorpaySecret(
    readDotEnvLocal("RAZORPAY_WEBHOOK_SECRET") || readRuntimeEnv("RAZORPAY_WEBHOOK_SECRET"),
  );
}

export function getRazorpayMode(): "test" | "live" {
  const explicit = (
    readDotEnvLocal("RAZORPAY_MODE") || readRuntimeEnv("RAZORPAY_MODE")
  ).toLowerCase();
  if (explicit === "live") return "live";
  if (explicit === "test") return "test";
  return getRazorpayKeyId().startsWith("rzp_live_") ? "live" : "test";
}

export function isRazorpayServerConfigured(): boolean {
  const pair = readCredentialPair();
  return pair.keyId.length > 0 && pair.keySecret.length > 0;
}

export type RazorpayServerDiagnostics = {
  keyIdPresent: boolean;
  keySecretPresent: boolean;
  keyIdPrefix: RazorpayKeyPrefix;
  keyIdFingerprint: string;
  razorpayKeyId: string;
  credentialSource: RazorpayCredentialPair["source"];
  mode: "test" | "live";
  secretLooksLikeKeyId: boolean;
  frontendKeyIdPrefix: RazorpayKeyPrefix;
  frontendBackendKeyIdsMatch: boolean;
  envVarNames: {
    keyId: string[];
    keySecret: string[];
    frontendKeyId: string[];
  };
};

function readFrontendKeyId(): string {
  return (
    readDotEnvLocal("VITE_RAZORPAY_KEY_ID") ||
    readRuntimeEnv("VITE_RAZORPAY_KEY_ID") ||
    readRuntimeEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID")
  );
}

/** Public-safe snapshot of Razorpay env. Never includes the Key Secret. */
export function getRazorpayDiagnostics(): RazorpayServerDiagnostics {
  const pair = readCredentialPair();
  const frontendKeyId = readFrontendKeyId();
  return {
    keyIdPresent: pair.keyId.length > 0,
    keySecretPresent: pair.keySecret.length > 0,
    keyIdPrefix: classifyRazorpayKeyPrefix(pair.keyId),
    keyIdFingerprint: razorpayKeyFingerprint(pair.keyId),
    razorpayKeyId: pair.keyId,
    credentialSource: pair.source,
    mode: getRazorpayMode(),
    secretLooksLikeKeyId: secretLooksLikeKeyId(pair.keySecret),
    frontendKeyIdPrefix: classifyRazorpayKeyPrefix(frontendKeyId),
    frontendBackendKeyIdsMatch: !frontendKeyId || frontendKeyId === pair.keyId,
    envVarNames: {
      keyId: ["RAZORPAY_KEY_ID", "VITE_RAZORPAY_KEY_ID"],
      keySecret: ["RAZORPAY_KEY_SECRET"],
      frontendKeyId: ["VITE_RAZORPAY_KEY_ID"],
    },
  };
}

function basicAuthHeader(pair: RazorpayCredentialPair): string {
  return `Basic ${encodeRazorpayBasicAuth(pair.keyId, pair.keySecret)}`;
}

function assertKeysMatchMode(pair: RazorpayCredentialPair): void {
  const mode = getRazorpayMode();
  if (mode !== "live" && pair.keyId.startsWith("rzp_live_")) {
    throw new Error("Live Razorpay keys cannot be used while RAZORPAY_MODE=test.");
  }
  if (mode === "live" && pair.keyId.startsWith("rzp_test_")) {
    throw new Error("TEST Razorpay keys cannot be used while RAZORPAY_MODE=live.");
  }
  if (secretLooksLikeKeyId(pair.keySecret)) {
    throw new Error(
      "RAZORPAY_KEY_SECRET looks like a Key ID. Set the Key Secret from dashboard.razorpay.com → Settings → API Keys.",
    );
  }
}

async function razorpayRequest<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T> {
  const pair = readCredentialPair();
  if (!pair.keyId || !pair.keySecret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  assertKeysMatchMode(pair);
  const res = await fetch(`${RAZORPAY_API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuthHeader(pair),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      formatRazorpayHttpError({
        status: res.status,
        method,
        path,
        bodyText: err,
        keyPrefix: classifyRazorpayKeyPrefix(pair.keyId),
        secretConfigured: pair.keySecret.length > 0,
        secretLooksLikeKeyId: secretLooksLikeKeyId(pair.keySecret),
      }),
    );
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

export async function updateRazorpayOrderNotes(
  orderId: string,
  notes: Record<string, string>,
): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>("PATCH", `/orders/${orderId}`, { notes });
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
  return readRuntimeEnv(key);
}

/** Authenticated GET used to verify the Key ID/Secret pair. Does not create a charge. */
export async function probeRazorpayApiAuth(): Promise<{
  ok: boolean;
  status: number;
  endpoint: string;
  errorCode: string | null;
  errorDescription: string | null;
}> {
  const pair = readCredentialPair();
  const endpoint = "GET /orders?count=1";
  if (!pair.keyId || !pair.keySecret) {
    return {
      ok: false,
      status: 0,
      endpoint,
      errorCode: "NOT_CONFIGURED",
      errorDescription: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.",
    };
  }
  const res = await fetch(`${RAZORPAY_API}/orders?count=1`, {
    method: "GET",
    headers: { Authorization: basicAuthHeader(pair) },
  });
  const text = await res.text();
  let errorCode: string | null = null;
  let errorDescription: string | null = null;
  try {
    const parsed = JSON.parse(text) as {
      error?: { code?: string; description?: string };
      items?: unknown[];
    };
    errorCode = parsed?.error?.code ?? null;
    errorDescription = parsed?.error?.description ?? null;
  } catch {
    errorDescription = res.ok ? null : "Unreadable Razorpay response";
  }
  return {
    ok: res.ok,
    status: res.status,
    endpoint,
    errorCode,
    errorDescription,
  };
}
