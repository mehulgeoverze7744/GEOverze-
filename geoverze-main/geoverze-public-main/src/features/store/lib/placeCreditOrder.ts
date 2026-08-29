import { supabase } from "@/lib/supabase/client";

export type PlaceCreditOrderLine = {
  product_id: string;
  quantity: number;
};

export type PlaceCreditOrderResult = {
  order_id: string;
  status: string;
  credits_total: number;
  lines: unknown[];
  entitlements: unknown[];
  new_balance: number;
  idempotent_replay: boolean;
};

export type CreditPurchaseErrorCode =
  | "unauthenticated"
  | "insufficient_credits"
  | "already_owned"
  | "inactive_product"
  | "invalid_product"
  | "generic";

export class CreditPurchaseError extends Error {
  readonly code: CreditPurchaseErrorCode;

  constructor(code: CreditPurchaseErrorCode, message: string) {
    super(message);
    this.name = "CreditPurchaseError";
    this.code = code;
  }
}

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `client:${crypto.randomUUID()}`;
  }
  return `client:${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const record = error as { message?: string; details?: string; hint?: string };
    return [record.message, record.details, record.hint].filter(Boolean).join(" ");
  }
  return String(error);
}

/** Maps Supabase/Postgres errors into stable application error codes. */
export function parseCreditPurchaseError(error: unknown): CreditPurchaseError {
  const message = extractErrorMessage(error);
  const lower = message.toLowerCase();

  if (lower.includes("authentication required") || lower.includes("jwt")) {
    return new CreditPurchaseError(
      "unauthenticated",
      "Sign in to claim rewards with your credits.",
    );
  }
  if (lower.includes("insufficient credit balance")) {
    return new CreditPurchaseError(
      "insufficient_credits",
      "You do not have enough credits for this reward.",
    );
  }
  if (lower.includes("already own product")) {
    return new CreditPurchaseError("already_owned", "You already own this reward.");
  }
  if (lower.includes("missing or inactive") || lower.includes("invalid credit price")) {
    return new CreditPurchaseError("inactive_product", "This reward is not available right now.");
  }
  if (
    lower.includes("invalid product_id") ||
    lower.includes("product_id is required") ||
    lower.includes("physical products cannot be purchased")
  ) {
    return new CreditPurchaseError(
      "invalid_product",
      "This product cannot be purchased with credits.",
    );
  }

  return new CreditPurchaseError("generic", "Purchase failed. Please try again.");
}

function parsePlaceCreditOrderResult(data: unknown): PlaceCreditOrderResult {
  if (!data || typeof data !== "object") {
    throw new CreditPurchaseError("generic", "Unexpected response from purchase.");
  }

  const row = data as Record<string, unknown>;

  return {
    order_id: String(row["order_id"] ?? ""),
    status: String(row["status"] ?? ""),
    credits_total: Number(row["credits_total"] ?? 0),
    lines: Array.isArray(row["lines"]) ? row["lines"] : [],
    entitlements: Array.isArray(row["entitlements"]) ? row["entitlements"] : [],
    new_balance: Number(row["new_balance"] ?? 0),
    idempotent_replay: Boolean(row["idempotent_replay"]),
  };
}

/** Calls place_credit_order — the only client-side purchase mutation. */
export async function placeCreditOrder(
  productId: string,
  quantity = 1,
): Promise<PlaceCreditOrderResult> {
  const lines: PlaceCreditOrderLine[] = [{ product_id: productId, quantity }];
  const idempotencyKey = createIdempotencyKey();

  const { data, error } = await supabase.rpc("place_credit_order", {
    _lines: lines,
    _idempotency_key: idempotencyKey,
  });

  if (error) throw parseCreditPurchaseError(error);
  return parsePlaceCreditOrderResult(data);
}
