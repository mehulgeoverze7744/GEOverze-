import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

/** Circular achievement badge with an unlock pop on reveal. */
export function AchievementBadge({
  icon: Icon,
  label,
  unlocked = false,
  size = 64,
  className,
}: {
  icon: LucideIcon;
  label: string;
  unlocked?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center gap-2 text-center", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full border transition-transform motion-snap hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100",
          unlocked
            ? "border-bronze/60 bg-gradient-bronze text-background shadow-[var(--glow-bronze)]"
            : "border-bronze/15 bg-[oklch(0.185_0.008_62)] text-foreground/50",
        )}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {unlocked ? (
          <Icon className="h-1/2 w-1/2" strokeWidth={1.8} />
        ) : (
          <Lock className="h-1/3 w-1/3" strokeWidth={1.8} />
        )}
      </span>
      <span className="text-[0.66rem] font-medium text-foreground/60">
        {label}
        <span className="sr-only">{unlocked ? " — unlocked" : " — locked"}</span>
      </span>
    </span>
  );
}
