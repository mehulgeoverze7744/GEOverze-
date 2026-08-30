import { Coins } from "lucide-react";

import { AnimatedCounter } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { MetaChip } from "@/features/play/components/Badges";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";
import { useProgressionStore } from "@/stores/progressionStore";

/** Available wallet balance from user_progression.credits. */
export function CreditBalanceSummary() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const balance = useProgressionStore((s) => s.player.credits);

  if (!signedIn) return null;

  return (
    <GameCard interactive={false} raised>
      <div className="p-6 sm:p-7">
        <MetaChip tone="bronze">
          <Coins className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" /> Available balance
        </MetaChip>
        <p className="mt-5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
          Credits you can spend now
        </p>
        <p className="mt-2 text-[clamp(2rem,4vw,2.75rem)] font-semibold tracking-tight text-foreground">
          <AnimatedCounter value={balance} className="text-bronze-glow" />{" "}
          <span className="text-lg text-foreground/60">{balance === 1 ? "Credit" : "Credits"}</span>
        </p>
        <p className="mt-3 text-[0.83rem] leading-relaxed text-foreground/55">
          Your wallet balance is reconciled on the server after every earn and GEOstore purchase.
        </p>
      </div>
    </GameCard>
  );
}
