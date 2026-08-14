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
    condition: "First victory against a NEW opponent this month",
    award: "+5 Credits",
    detail: "Each new opponent you defeat inside the calendar month.",
  },
  {
    id: "second",
    condition: "Second victory against the SAME opponent",
    award: "+3 Credits",
    detail: "Rematches still pay, at a reduced rate.",
  },
  {
    id: "third",
    condition: "Third victory against the SAME opponent",
    award: "+2 Credits",
    detail: "The third win against one player.",
  },
  {
    id: "repeat",
    condition: "Fourth and every additional victory against the SAME opponent",
    award: "+1 Credit",
    detail: "Repeat wins keep a flat value for the rest of the month.",
  },
] as const;

export type CreditReason = "New Opponent" | "Second Win" | "Third Win" | "Repeated Win";

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
    reason: "New Opponent",
    status: "credited",
  },
  {
    id: "c2",
    date: "Aug 4, 2026",
    opponent: "Alex",
    opponentAvatarId: "atlas",
    matchType: "Ranked Duel",
    credits: 1,
    reason: "Repeated Win",
    status: "credited",
  },
  {
    id: "c3",
    date: "Aug 3, 2026",
    opponent: "Alex",
    opponentAvatarId: "atlas",
    matchType: "1v1 Duel",
    credits: 2,
    reason: "Third Win",
    status: "credited",
  },
  {
    id: "c4",
    date: "Aug 2, 2026",
    opponent: "Alex",
    opponentAvatarId: "atlas",
    matchType: "1v1 Duel",
    credits: 3,
    reason: "Second Win",
    status: "credited",
  },
  {
    id: "c5",
    date: "Aug 1, 2026",
    opponent: "Alex",
    opponentAvatarId: "atlas",
    matchType: "1v1 Duel",
    credits: 5,
    reason: "New Opponent",
    status: "credited",
  },
  {
    id: "c6",
    date: "Aug 1, 2026",
    opponent: "Noor",
    opponentAvatarId: "meridian",
    matchType: "Multiplayer",
    credits: 5,
    reason: "New Opponent",
    status: "pending",
  },
] as const;
