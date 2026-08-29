/**
 * Official GEOverze credit rules and a placeholder monthly ledger.
 *
 * The rules are educational UI only — no calculation happens anywhere.
 */

export type CreditRule = {
  id: string;
  condition: string;
  award: string;
  detail: string;
};

export const CREDIT_RULES: readonly CreditRule[] = [
  {
    id: "first",
    condition: "First victory against a new opponent this month",
    award: "+5 Credits",
    detail: "Each new opponent you defeat inside the calendar month.",
  },
  {
    id: "repeat",
    condition: "Every additional victory against the same opponent this month",
    award: "+1 Credit",
    detail: "Rematches still pay, at a flat repeat rate for the rest of the month.",
  },
] as const;

export type CreditReason =
  | "First win"
  | "Repeat win"
  | "Multiplayer — 1st Place"
  | "Multiplayer — 2nd Place"
  | "Multiplayer — 3rd Place"
  | "Legacy — Second Win"
  | "Legacy — Third Win"
  | "Legacy — Repeated Win"
  | "Legacy — Placement reward";

export type CreditEntry = {
  id: string;
  date: string;
  opponent: string;
  opponentAvatarId: string;
  matchType: "1v1 Duel" | "Multiplayer" | "Ranked Duel";
  credits: number;
  reason: CreditReason;
  status: "credited" | "pending";
};

export const CREDIT_HISTORY: readonly CreditEntry[] = [
  {
    id: "c1",
    date: "Aug 5, 2026",
    opponent: "Emma",
    opponentAvatarId: "compass",
    matchType: "1v1 Duel",
    credits: 5,
    reason: "First win",
    status: "credited",
  },
  {
    id: "c2",
    date: "Aug 4, 2026",
    opponent: "Alex",
    opponentAvatarId: "atlas",
    matchType: "Ranked Duel",
    credits: 1,
    reason: "Repeat win",
    status: "credited",
  },
  {
    id: "c3",
    date: "Aug 1, 2026",
    opponent: "Alex",
    opponentAvatarId: "atlas",
    matchType: "1v1 Duel",
    credits: 5,
    reason: "First win",
    status: "credited",
  },
  {
    id: "c4",
    date: "Aug 1, 2026",
    opponent: "Noor",
    opponentAvatarId: "meridian",
    matchType: "Multiplayer",
    credits: 5,
    reason: "Multiplayer — 1st Place",
    status: "pending",
  },
] as const;
