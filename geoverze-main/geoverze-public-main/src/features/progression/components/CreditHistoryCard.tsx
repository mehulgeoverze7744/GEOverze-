import { CheckCircle2, MinusCircle, Scale } from "lucide-react";

import { AvatarMark } from "@/features/auth/components/AvatarMark";
import { cn } from "@/lib/utils";

import type { CreditLedgerDisplayEntry } from "../data/credits";

/** One credit ledger row — earn, spend, or adjustment. */
export function CreditHistoryCard({ entry }: { entry: CreditLedgerDisplayEntry }) {
  const isSpent = entry.direction === "spent";
  const isAdjustment = entry.statusLabel === "Adjustment";

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-bronze/12 bg-[oklch(0.185_0.008_62)] p-4 sm:p-5">
      <AvatarMark id={entry.avatarId} size={44} className="border border-bronze/25" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{entry.headline}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-foreground/50">
          <span>{entry.dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.timeLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.detail}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <span
            className={cn(
              "rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em]",
              isSpent
                ? "border-foreground/20 bg-foreground/5 text-foreground/75"
                : "border-bronze/45 bg-bronze/15 text-bronze-glow",
            )}
          >
            {isSpent ? "−" : "+"}
            {entry.amount} {entry.amount === 1 ? "Credit" : "Credits"}
          </span>
          <p className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-foreground/45">
            {entry.statusLabel}
          </p>
        </div>
        {isAdjustment ? (
          <Scale className="h-4 w-4 text-foreground/50" strokeWidth={2} aria-label="Adjustment" />
        ) : isSpent ? (
          <MinusCircle className="h-4 w-4 text-foreground/50" strokeWidth={2} aria-label="Spent" />
        ) : (
          <CheckCircle2
            className="h-4 w-4 text-[oklch(0.78_0.13_150)]"
            strokeWidth={2}
            aria-label="Earned"
          />
        )}
      </div>
    </li>
  );
}
