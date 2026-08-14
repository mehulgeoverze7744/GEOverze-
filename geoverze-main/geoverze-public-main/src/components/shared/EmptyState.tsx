import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { GlassCard } from "./GlassCard";

/** Neutral "nothing here yet" state. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <GlassCard className="flex flex-col items-center px-8 py-16 text-center">
      {Icon ? (
        <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze">
          <Icon className="h-6 w-6" strokeWidth={1.3} />
        </span>
      ) : null}
      <h3 className="text-lg font-light tracking-tight text-foreground">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/50">{description}</p>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </GlassCard>
  );
}
