import { CheckCircle2, Clock3 } from "lucide-react";

import { AvatarMark } from "@/features/auth/components/AvatarMark";
import type { CreditEntry } from "../data/credits";

/** One credit ledger row. */
export function CreditHistoryCard({ entry }: { entry: CreditEntry }) {
  const credited = entry.status === "credited";

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-bronze/12 bg-[oklch(0.185_0.008_62)] p-4 sm:p-5">
      <AvatarMark id={entry.opponentAvatarId} size={44} className="border border-bronze/25" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {entry.matchType === "Multiplayer" ? entry.reason : `Defeated ${entry.opponent}`}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-foreground/50">
          <span>{entry.date}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.matchType}</span>
          <span aria-hidden="true">·</span>
          <span className="text-foreground/60">({entry.reason})</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="rounded-full border border-bronze/45 bg-bronze/15 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-bronze-glow">
          +{entry.credits} {entry.credits === 1 ? "Credit" : "Credits"}
        </span>
        {credited ? (
          <CheckCircle2
            className="h-4 w-4 text-[oklch(0.78_0.13_150)]"
            strokeWidth={2}
            aria-label="Credited"
          />
        ) : (
          <Clock3 className="h-4 w-4 text-foreground/50" strokeWidth={2} aria-label="Pending" />
        )}
      </div>
    </li>
  );
}
