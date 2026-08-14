import type { LucideIcon } from "lucide-react";

import { AnimatedCounter } from "./AnimatedCounter";
import { AnimatedSection } from "./AnimatedSection";
import { GlassCard } from "./GlassCard";

export type StatTile = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  hint?: string;
  icon: LucideIcon;
};

/**
 * Responsive grid of animated metric tiles.
 * Shared by the profile record, dashboard summaries and progress surfaces.
 */
export function StatGrid({
  stats,
  columns = 4,
}: {
  stats: readonly StatTile[];
  /** Desktop column count. */
  columns?: 2 | 3 | 4;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-4 ${cols}`}>
      {stats.map((stat, index) => (
        <AnimatedSection key={stat.id} delay={index * 50}>
          <GlassCard className="h-full p-6 transition-colors motion-base hover:border-bronze/35">
            <div className="flex items-start justify-between">
              <p className="text-[clamp(1.5rem,2.6vw,2.1rem)] font-light leading-none text-gradient-bronze">
                <AnimatedCounter
                  value={stat.value}
                  decimals={stat.decimals ?? 0}
                  suffix={stat.suffix ?? ""}
                />
              </p>
              <stat.icon className="h-4 w-4 text-bronze/90" strokeWidth={1.4} aria-hidden="true" />
            </div>
            <p className="mt-4 text-[0.66rem] uppercase tracking-[0.26em] text-foreground/50">
              {stat.label}
            </p>
            {stat.hint ? <p className="mt-2 text-xs text-foreground/50">{stat.hint}</p> : null}
          </GlassCard>
        </AnimatedSection>
      ))}
    </div>
  );
}
