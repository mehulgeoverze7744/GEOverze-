import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { CreditProgressBar } from "@/features/progression/components/CreditProgressBar";
import { REDEMPTION } from "@/features/progression/data/player";
import { useCreditHistory } from "@/features/progression/hooks/useCreditHistory";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";

/** Rewards tab — credits balance and monthly redemption progress. */
export function RewardSummary() {
  const player = useProgressionStore(selectPlayer);
  const { monthlyEarned, loading } = useCreditHistory();

  return (
    <div>
      <p className="hr-panel-label">Rewards</p>
      <p className="mb-4 max-w-lg text-sm text-foreground/48">
        Your exploration has value — credits earned through play can be redeemed for GEOstore
        rewards.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="hr-reward-card">
          <p className="hr-reward-label">Geo credits</p>
          <p className="hr-reward-value text-gradient-bronze">
            <AnimatedCounter value={player.credits} />
          </p>
          <p className="hr-reward-note">Available balance</p>
        </div>

        <div className="hr-reward-card">
          <CreditProgressBar
            credits={loading ? 0 : monthlyEarned}
            goal={REDEMPTION.goal}
            label="Monthly redemption progress"
          />
        </div>
      </div>

      <Link
        to="/geostore/rewards"
        className="mt-5 inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-bronze/90 transition-colors hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
      >
        Browse redeemable rewards
        <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </div>
  );
}
