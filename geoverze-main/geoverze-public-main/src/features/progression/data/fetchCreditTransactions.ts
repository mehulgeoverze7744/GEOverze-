import { supabase } from "@/lib/supabase/client";

import type { CreditReason } from "../data/credits";

export type CreditTransactionRow = {
  id: string;
  amount: number;
  win_tier: number;
  month_key: string;
  created_at: string;
  opponent_user_id: string | null;
  opponent_username: string;
  reason: CreditReason;
  matchType: "1v1 Duel" | "Multiplayer";
};

const PVP_TIER_TO_REASON: Record<number, CreditReason> = {
  1: "New Opponent",
  2: "Second Win",
  3: "Third Win",
  4: "Repeated Win",
};

const MP_PLACEMENT_TO_REASON: Record<number, CreditReason> = {
  1: "Multiplayer — 1st Place",
  2: "Multiplayer — 2nd Place",
  3: "Multiplayer — 3rd Place",
};

/** Fetch the caller's credit ledger rows for the current calendar month. */
export async function fetchCreditTransactions(): Promise<CreditTransactionRow[]> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("id, amount, win_tier, month_key, created_at, opponent_user_id, room_id")
    .eq("month_key", monthStart)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data?.length) return [];

  const roomIds = [...new Set(data.map((row) => row.room_id))];
  const { data: rooms } = await supabase
    .from("pvp_rooms")
    .select("id, room_mode")
    .in("id", roomIds);

  const roomModeById = new Map((rooms ?? []).map((room) => [room.id, room.room_mode]));

  const opponentIds = [
    ...new Set(data.map((row) => row.opponent_user_id).filter((id): id is string => id != null)),
  ];

  const nameById = new Map<string, string>();
  if (opponentIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", opponentIds);

    for (const profile of profiles ?? []) {
      nameById.set(profile.id, profile.username ?? profile.display_name ?? "Opponent");
    }
  }

  return data.map((row) => {
    const isMultiplayer = roomModeById.get(row.room_id) === "multiplayer";

    if (isMultiplayer) {
      return {
        id: row.id,
        amount: row.amount,
        win_tier: row.win_tier,
        month_key: row.month_key,
        created_at: row.created_at,
        opponent_user_id: row.opponent_user_id,
        opponent_username: "Placement reward",
        matchType: "Multiplayer" as const,
        reason: MP_PLACEMENT_TO_REASON[row.win_tier] ?? "Multiplayer — 1st Place",
      };
    }

    return {
      id: row.id,
      amount: row.amount,
      win_tier: row.win_tier,
      month_key: row.month_key,
      created_at: row.created_at,
      opponent_user_id: row.opponent_user_id,
      opponent_username: row.opponent_user_id
        ? (nameById.get(row.opponent_user_id) ?? "Opponent")
        : "Opponent",
      matchType: "1v1 Duel" as const,
      reason: PVP_TIER_TO_REASON[row.win_tier] ?? "Repeated Win",
    };
  });
}
