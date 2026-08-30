/**
 * Official GEOverze credit rules and ledger display types.
 *
 * Rules are educational UI only — balances and history come from the server.
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

/** User-facing expiry copy (Free tier until PAY-2 plan resolution). */
export const CREDIT_EXPIRY_NOTE =
  "Credits earned in a calendar month stay available through the following calendar month on Free, Basic, and Pro. Advance extends that window to two calendar months.";

export type CreditHistoryFilter = "All" | "Earned" | "Spent" | "Gameplay" | "GEOstore";

export const CREDIT_HISTORY_FILTERS: readonly CreditHistoryFilter[] = [
  "All",
  "Earned",
  "Spent",
  "Gameplay",
  "GEOstore",
] as const;

export type CreditLedgerDirection = "earned" | "spent";

export type CreditLedgerCategory = "gameplay" | "geostore" | "adjustment" | "membership" | "other";

export type CreditLedgerDisplayEntry = {
  id: string;
  createdAt: string;
  dateLabel: string;
  timeLabel: string;
  direction: CreditLedgerDirection;
  /** Absolute magnitude for display. */
  amount: number;
  /** Signed ledger amount. */
  signedAmount: number;
  headline: string;
  detail: string;
  category: CreditLedgerCategory;
  entryType: string;
  statusLabel: "Earned" | "Spent" | "Adjustment";
  filterTags: CreditHistoryFilter[];
  avatarId: string;
};

export type ExpiringCreditLot = {
  id: string;
  remainingAmount: number;
  expiresAt: string;
  expiresLabel: string;
};

/** @deprecated Legacy duel-only type — use CreditLedgerDisplayEntry. */
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
