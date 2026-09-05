import { Link } from "@tanstack/react-router";
import { Coins } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { GeoButton } from "@/components/shared/GeoButton";
import { CreditProgressBar } from "@/features/progression/components/CreditProgressBar";
import { useCreditHistory } from "@/features/progression/hooks/useCreditHistory";
import { REDEMPTION } from "@/features/progression/data/player";
import { useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

/** Premium reward currency module for GEO credits. */
export function GeoCreditsModule({ className }: { className?: string }) {
  const walletBalance = useProgressionStore((s) => s.player.credits);
  const { monthlyEarned } = useCreditHistory();

  return (
    <section
      className={cn(
        "dashboard-credits relative overflow-hidden rounded-2xl border border-bronze/22 bg-charcoal/35 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="geo-credits-heading"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-bronze/10 blur-2xl"
        aria-hidden="true"
      />

      <h2
        id="geo-credits-heading"
        className="dashboard-section-label flex items-center gap-2"
      >
        <Coins className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Geo credits
      </h2>

      <p className="mt-6 text-[clamp(2rem,4vw,2.75rem)] font-light leading-none text-gradient-bronze">
        <AnimatedCounter value={walletBalance} />
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-foreground/50">Available</p>
      <p className="mt-2 text-xs text-foreground/50">
        +{monthlyEarned} earned this month from gameplay
      </p>

      <div className="mt-6 border-t border-bronze/10 pt-6">
        <CreditProgressBar
          credits={monthlyEarned}
          goal={REDEMPTION.goal}
          label="Monthly progress"
        />
      </div>

      <GeoButton asChild variant="ghost" size="sm" className="mt-6">
        <Link to="/play/credit-history">View credit history</Link>
      </GeoButton>
    </section>
  );
}
