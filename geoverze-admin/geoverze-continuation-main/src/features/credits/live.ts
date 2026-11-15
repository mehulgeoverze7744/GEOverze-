import type { CreditReason, CreditTransaction } from "@/features/credits/types";
import { fetchCreditLedger } from "@/features/commerce/api";

function directionFor(amount: number, entryType: string): CreditTransaction["direction"] {
  if (entryType === "admin_adjustment") return "adjusted";
  return amount < 0 ? "redeemed" : "issued";
}

export async function fetchCreditTransactions(): Promise<CreditTransaction[]> {
  const rows = await fetchCreditLedger();
  return rows.map((row) => {
    const metadata = (row.metadata ?? {}) as { reason?: string; actor_id?: string };
    return {
      id: row.id,
      userId: row.user_id,
      user: row.user_id,
      direction: directionFor(row.amount, row.entry_type),
      amount: Math.abs(row.amount),
      balanceAfter: 0,
      reason: (metadata.reason as CreditReason | undefined) ?? "Manual adjustment",
      reference: row.reference_type ?? row.entry_type,
      actor: metadata.actor_id ?? "system",
      createdAt: row.created_at,
    };
  });
}
