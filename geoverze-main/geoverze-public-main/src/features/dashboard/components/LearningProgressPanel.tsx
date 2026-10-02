import { Target } from "lucide-react";

import { ProgressRing } from "@/components/shared/ProgressRing";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

/** World-knowledge rings — only when geography tagging exists. */
export function LearningProgressPanel({ className }: { className?: string }) {
  const player = useProgressionStore(selectPlayer);
  const explored = player.countriesExplored;

  return (
    <section
      className={cn(
        "rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="learning-progress-heading"
    >
      <h2
        id="learning-progress-heading"
        className="dashboard-section-label flex items-center gap-2"
      >
        <Target className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Your world knowledge
      </h2>

      {explored > 0 ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          <li className="flex items-center gap-4">
            <ProgressRing
              value={Math.round((explored / player.countriesTotal) * 100)}
              label="Countries explored"
              size={72}
              thickness={4}
            >
              <span className="text-xs font-medium text-gradient-bronze">
                {Math.round((explored / player.countriesTotal) * 100)}%
              </span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-foreground/50">
                Countries
              </p>
              <p className="mt-1 text-sm text-foreground/85">
                {explored} of {player.countriesTotal}
              </p>
            </div>
          </li>
        </ul>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-foreground/50">
          Country, capital and flag coverage will appear here once quiz geography tagging is live.
        </p>
      )}
    </section>
  );
}
