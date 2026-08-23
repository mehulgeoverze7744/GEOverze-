import { supabase } from "@/lib/supabase/client";

import type { CreditReason } from "../data/credits";

export type CreditTransactionRow = {
  id: string;
  amount: number;
  win_tier: number;
  month_key: string;
  created_at: string;
  opponent_user_id: string;
  opponent_username: string;
  reason: CreditReason;
};

const TIER_TO_REASON: Record<number, CreditReason> = {
  1: "New Opponent",
  2: "Second Win",
  3: "Third Win",
  4: "Repeated Win",
};

/** Fetch the caller's PvP credit ledger rows for the current calendar month. */
export async function fetchCreditTransactions(): Promise<CreditTransactionRow[]> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("id, amount, win_tier, month_key, created_at, opponent_user_id")
    .eq("month_key", monthStart)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data?.length) return [];

  const opponentIds = [...new Set(data.map((row) => row.opponent_user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", opponentIds);

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.username ?? p.display_name ?? "Opponent"]),
  );

  return data.map((row) => ({
    id: row.id,
    amount: row.amount,
    win_tier: row.win_tier,
    month_key: row.month_key,
    created_at: row.created_at,
    opponent_user_id: row.opponent_user_id,
    opponent_username: nameById.get(row.opponent_user_id) ?? "Opponent",
    reason: TIER_TO_REASON[row.win_tier] ?? "Repeated Win",
  }));
}
