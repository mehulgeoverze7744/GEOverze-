import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

/** Lifetime ledger page size — avoids loading unbounded history. */
export const CREDIT_LEDGER_LIMIT = 200;

export type CreditLedgerRow = Database["public"]["Tables"]["credit_ledger_entries"]["Row"];

export type StoreOrderLineSummary = Pick<
  Database["public"]["Tables"]["store_order_lines"]["Row"],
  "order_id" | "product_name" | "product_slug" | "line_credits" | "quantity" | "unit_credits"
>;

export type CreditLedgerRawBundle = {
  rows: CreditLedgerRow[];
  orderLinesByOrderId: ReadonlyMap<string, readonly StoreOrderLineSummary[]>;
  opponentNamesById: ReadonlyMap<string, string>;
};

function readMetadataString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function readMetadataNumber(metadata: unknown, key: string): number | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "number" ? value : null;
}

/** Fetch the caller's credit ledger with supporting store and profile lookups. */
export async function fetchCreditLedgerEntries(): Promise<CreditLedgerRawBundle> {
  const { data, error } = await supabase
    .from("credit_ledger_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(CREDIT_LEDGER_LIMIT);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  if (rows.length === 0) {
    return {
      rows: [],
      orderLinesByOrderId: new Map(),
      opponentNamesById: new Map(),
    };
  }

  const orderIds = [
    ...new Set(
      rows
        .filter((row) => row.reference_type === "store_order" && row.reference_id)
        .map((row) => row.reference_id as string),
    ),
  ];

  const opponentIds = new Set<string>();
  for (const row of rows) {
    const opponentId = readMetadataString(row.metadata, "opponent_user_id");
    if (opponentId) opponentIds.add(opponentId);
  }

  const orderLinesByOrderId = new Map<string, StoreOrderLineSummary[]>();
  if (orderIds.length > 0) {
    const { data: lines, error: linesError } = await supabase
      .from("store_order_lines")
      .select("order_id, product_name, product_slug, line_credits, quantity, unit_credits")
      .in("order_id", orderIds);

    if (linesError) throw new Error(linesError.message);

    for (const line of lines ?? []) {
      const bucket = orderLinesByOrderId.get(line.order_id) ?? [];
      bucket.push(line);
      orderLinesByOrderId.set(line.order_id, bucket);
    }
  }

  const opponentNamesById = new Map<string, string>();
  if (opponentIds.size > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", [...opponentIds]);

    if (profilesError) throw new Error(profilesError.message);

    for (const profile of profiles ?? []) {
      opponentNamesById.set(profile.id, profile.username ?? profile.display_name ?? "Opponent");
    }
  }

  return { rows, orderLinesByOrderId, opponentNamesById };
}

export function metadataOpponentId(metadata: unknown): string | null {
  return readMetadataString(metadata, "opponent_user_id");
}

export function metadataWinTier(metadata: unknown): number | null {
  return readMetadataNumber(metadata, "win_tier");
}

export function metadataFinishRank(metadata: unknown): number | null {
  return readMetadataNumber(metadata, "finish_rank");
}
