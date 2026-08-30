import type {
  CreditHistoryFilter,
  CreditLedgerCategory,
  CreditLedgerDisplayEntry,
  CreditLedgerDirection,
  ExpiringCreditLot,
} from "../data/credits";
import type { CreditLedgerRawBundle, CreditLedgerRow } from "../data/fetchCreditLedgerEntries";
import {
  metadataFinishRank,
  metadataOpponentId,
  metadataWinTier,
} from "../data/fetchCreditLedgerEntries";

const PVP_TIER_LABELS: Record<number, string> = {
  1: "First win",
  2: "Repeat win",
  3: "Legacy — Third Win",
  4: "Legacy — Repeated Win",
};

const MP_RANK_LABELS: Record<number, string> = {
  1: "Multiplayer — 1st Place",
  2: "Multiplayer — 2nd Place",
  3: "Multiplayer — 3rd Place",
};

const GAMEPLAY_ENTRY_TYPES = new Set(["earn_pvp", "earn_multiplayer"]);

function currentMonthKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatDateParts(iso: string): { dateLabel: string; timeLabel: string } {
  const date = new Date(iso);
  return {
    dateLabel: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    timeLabel: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function formatExpiryLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function directionFor(row: CreditLedgerRow): CreditLedgerDirection {
  return row.amount < 0 ? "spent" : "earned";
}

function categoryFor(row: CreditLedgerRow): CreditLedgerCategory {
  if (row.entry_type === "store_spend") return "geostore";
  if (GAMEPLAY_ENTRY_TYPES.has(row.entry_type)) return "gameplay";
  if (row.entry_type === "reconciliation_opening") return "adjustment";
  return "other";
}

function filtersFor(row: CreditLedgerRow, category: CreditLedgerCategory): CreditHistoryFilter[] {
  const tags: CreditHistoryFilter[] = ["All"];

  if (row.amount > 0 && category === "gameplay") {
    tags.push("Earned", "Gameplay");
  } else if (row.amount < 0 || row.entry_type === "store_spend") {
    tags.push("Spent", "GEOstore");
  } else if (row.amount > 0 && category !== "adjustment") {
    tags.push("Earned");
  }

  if (category === "gameplay") tags.push("Gameplay");
  if (category === "geostore") tags.push("GEOstore");

  return [...new Set(tags)];
}

function pvpReasonLabel(winTier: number | null): string {
  if (winTier == null) return "Duel victory";
  return PVP_TIER_LABELS[winTier] ?? "Repeat win";
}

function mpReasonLabel(finishRank: number | null): string {
  if (finishRank == null) return "Multiplayer placement";
  return MP_RANK_LABELS[finishRank] ?? "Multiplayer placement";
}

function mapGameplayHeadline(
  row: CreditLedgerRow,
  bundle: CreditLedgerRawBundle,
): { headline: string; detail: string; avatarId: string } {
  const opponentId = metadataOpponentId(row.metadata);
  const opponentName = opponentId ? (bundle.opponentNamesById.get(opponentId) ?? "Opponent") : null;

  if (row.entry_type === "earn_multiplayer") {
    const reason = mpReasonLabel(metadataFinishRank(row.metadata));
    return {
      headline: reason,
      detail: "Multiplayer",
      avatarId: "meridian",
    };
  }

  const reason = pvpReasonLabel(metadataWinTier(row.metadata));
  if (opponentName) {
    return {
      headline: `${reason} vs ${opponentName}`,
      detail: "1v1 Duel",
      avatarId: "compass",
    };
  }

  return {
    headline: reason,
    detail: "1v1 Duel",
    avatarId: "compass",
  };
}

function mapStoreSpendHeadline(
  row: CreditLedgerRow,
  bundle: CreditLedgerRawBundle,
): { headline: string; detail: string; avatarId: string } {
  const orderId = row.reference_id;
  const lines = orderId != null ? (bundle.orderLinesByOrderId.get(orderId) ?? []) : [];

  if (lines.length === 1) {
    const line = lines[0];
    if (line) {
      return {
        headline: line.product_name,
        detail: "GEOstore reward",
        avatarId: "atlas",
      };
    }
  }

  if (lines.length > 1) {
    const names = lines.map((line) => line.product_name).join(", ");
    return {
      headline: `GEOstore order (${lines.length} items)`,
      detail: names,
      avatarId: "atlas",
    };
  }

  return {
    headline: "GEOstore reward",
    detail: orderId ? "Store order" : "Credit purchase",
    avatarId: "atlas",
  };
}

function mapEntry(row: CreditLedgerRow, bundle: CreditLedgerRawBundle): CreditLedgerDisplayEntry {
  const { dateLabel, timeLabel } = formatDateParts(row.created_at);
  const category = categoryFor(row);
  const direction = directionFor(row);
  const signedAmount = row.amount;
  const amount = Math.abs(row.amount);

  let headline = "Credit activity";
  let detail = row.entry_type.replaceAll("_", " ");
  let avatarId = "compass";
  let statusLabel: CreditLedgerDisplayEntry["statusLabel"] =
    direction === "earned" ? "Earned" : "Spent";

  if (category === "gameplay") {
    const gameplay = mapGameplayHeadline(row, bundle);
    headline = gameplay.headline;
    detail = gameplay.detail;
    avatarId = gameplay.avatarId;
    statusLabel = "Earned";
  } else if (category === "geostore") {
    const store = mapStoreSpendHeadline(row, bundle);
    headline = store.headline;
    detail = store.detail;
    avatarId = store.avatarId;
    statusLabel = "Spent";
  } else if (row.entry_type === "reconciliation_opening") {
    headline = "Opening balance";
    detail = "Account adjustment";
    avatarId = "atlas";
    statusLabel = "Adjustment";
  } else if (direction === "earned") {
    headline = "Credits earned";
    statusLabel = "Earned";
  } else {
    headline = "Credits spent";
    statusLabel = "Spent";
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    dateLabel,
    timeLabel,
    direction,
    amount,
    signedAmount,
    headline,
    detail,
    category,
    entryType: row.entry_type,
    statusLabel,
    filterTags: filtersFor(row, category),
    avatarId,
  };
}

export function mapCreditLedgerBundle(bundle: CreditLedgerRawBundle): {
  entries: CreditLedgerDisplayEntry[];
  expiringLots: ExpiringCreditLot[];
  monthlyEarned: number;
} {
  const now = Date.now();
  const monthKey = currentMonthKey();

  const entries = bundle.rows.map((row) => mapEntry(row, bundle));

  const expiringLots: ExpiringCreditLot[] = bundle.rows
    .filter(
      (row) =>
        row.amount > 0 &&
        row.remaining_amount != null &&
        row.remaining_amount > 0 &&
        row.expires_at != null &&
        new Date(row.expires_at).getTime() > now,
    )
    .map((row) => ({
      id: row.id,
      remainingAmount: row.remaining_amount as number,
      expiresAt: row.expires_at as string,
      expiresLabel: formatExpiryLabel(row.expires_at as string),
    }))
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

  const monthlyEarned = bundle.rows.reduce((sum, row) => {
    if (row.amount <= 0 || !GAMEPLAY_ENTRY_TYPES.has(row.entry_type)) return sum;

    const rowMonth =
      row.month_key ??
      `${new Date(row.created_at).getFullYear()}-${String(new Date(row.created_at).getMonth() + 1).padStart(2, "0")}-01`;

    if (rowMonth !== monthKey) return sum;
    return sum + row.amount;
  }, 0);

  return { entries, expiringLots, monthlyEarned };
}

export function filterLedgerEntries(
  entries: readonly CreditLedgerDisplayEntry[],
  filter: CreditHistoryFilter,
): CreditLedgerDisplayEntry[] {
  if (filter === "All") return [...entries];
  return entries.filter((entry) => entry.filterTags.includes(filter));
}

export function aggregateExpiringLots(
  lots: readonly ExpiringCreditLot[],
): { expiresLabel: string; totalAmount: number }[] {
  const byDate = new Map<string, number>();

  for (const lot of lots) {
    byDate.set(lot.expiresLabel, (byDate.get(lot.expiresLabel) ?? 0) + lot.remainingAmount);
  }

  return [...byDate.entries()].map(([expiresLabel, totalAmount]) => ({
    expiresLabel,
    totalAmount,
  }));
}
