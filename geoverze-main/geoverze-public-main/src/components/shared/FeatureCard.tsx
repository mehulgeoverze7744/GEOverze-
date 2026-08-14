import type { LucideIcon } from "lucide-react";
import { memo } from "react";

import { GlassCard } from "./GlassCard";

/** Icon + title + copy card used across marketing and module pages. */
export const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <GlassCard interactive className="p-7">
      {Icon ? (
        <span
          aria-hidden
          className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze"
        >
          <Icon className="h-5 w-5" strokeWidth={1.4} />
        </span>
      ) : null}
      <h3 className="text-base font-medium tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground/55">{description}</p>
    </GlassCard>
  );
});
