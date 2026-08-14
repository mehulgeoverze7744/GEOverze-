import { memo } from "react";

import { GlassCard } from "./GlassCard";

/** Single metric tile. */
export const StatCard = memo(function StatCard({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <GlassCard className="p-6">
      <p className="font-light leading-none text-gradient-bronze text-[clamp(1.8rem,3vw,2.6rem)]">
        {value}
      </p>
      <p className="mt-4 text-[0.68rem] uppercase tracking-[0.28em] text-foreground/50">{label}</p>
      {hint ? <p className="mt-2 text-xs text-foreground/50">{hint}</p> : null}
    </GlassCard>
  );
});
