import { Target } from "lucide-react";

import { ProgressRing } from "@/components/shared/ProgressRing";
import { LEARNING_PROGRESS } from "@/features/dashboard/data/dashboard";
import { cn } from "@/lib/utils";

/** Visual world-knowledge progress modules with rings. */
export function LearningProgressPanel({ className }: { className?: string }) {
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

      <ul className="mt-6 grid gap-5 sm:grid-cols-2">
        {LEARNING_PROGRESS.map((track) => (
          <li key={track.id} className="flex items-center gap-4">
            <ProgressRing value={track.value} label={track.label} size={72} thickness={4}>
              <span className="text-xs font-medium text-gradient-bronze">{track.value}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-foreground/50">
                {track.label}
              </p>
              <p className="mt-1 text-sm text-foreground/85">{track.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
