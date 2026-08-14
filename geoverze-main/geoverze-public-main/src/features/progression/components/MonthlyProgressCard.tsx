import { CalendarClock, Coins, Wallet } from "lucide-react";

import { GameCard } from "@/features/play/components/GameCard";
import { MetaChip } from "@/features/play/components/Badges";
import { REDEMPTION } from "../data/player";
import { creditProgress, monthMeta } from "../lib/progress";
import { CreditProgressBar } from "./CreditProgressBar";

/** Monthly credit tracker: goal, progress, reset date and reward preview. */
export function MonthlyProgressCard({ credits }: { credits: number }) {
  const { month, resetLabel } = monthMeta();
  const { eligible, remaining } = creditProgress(credits, REDEMPTION.goal);

  return (
    <GameCard interactive={false} raised>
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MetaChip tone="bronze">
            <Coins className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" /> Monthly tracker
          </MetaChip>
          <MetaChip>{month}</MetaChip>
        </div>

        <p className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          {REDEMPTION.goal} credits in one month
        </p>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-foreground/60">
          Reach the goal inside the same calendar month to become eligible to redeem{" "}
          <span className="font-semibold text-bronze-glow">{REDEMPTION.rewardLabel}</span>.
        </p>

        <CreditProgressBar className="mt-6" credits={credits} goal={REDEMPTION.goal} />

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Current credits
            </dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">{credits}</dd>
          </div>
          <div>
            <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Remaining
            </dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">{remaining}</dd>
          </div>
          <div>
            <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Status
            </dt>
            <dd className="mt-1 text-sm font-semibold text-bronze-glow">
              {eligible ? "Eligible" : "In progress"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-3 border-t border-bronze/12 pt-5 text-xs text-foreground/50 sm:grid-cols-2">
          <p className="inline-flex items-center gap-2">
            <CalendarClock
              className="h-3.5 w-3.5 text-bronze/90"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Next reset: {resetLabel} (placeholder)
          </p>
          <p className="inline-flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} aria-hidden="true" />
            {REDEMPTION.note}
          </p>
        </div>
      </div>
    </GameCard>
  );
}
