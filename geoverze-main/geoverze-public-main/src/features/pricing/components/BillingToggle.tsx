import { cn } from "@/lib/utils";

import type { BillingCycle } from "../data/plans";

const OPTIONS: { id: BillingCycle; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
];

/** Monthly / annual switch. Accessible pair of toggle buttons. */
export function BillingToggle({
  cycle,
  onChange,
  className,
}: {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <div
        role="group"
        aria-label="Billing frequency"
        className="glass-panel inline-flex items-center gap-1 rounded-full p-1"
      >
        {OPTIONS.map((option) => {
          const active = option.id === cycle;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "min-h-9 rounded-full px-5 text-[0.65rem] uppercase tracking-[var(--tracking-button)] transition-all motion-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                active
                  ? "border border-bronze/45 bg-bronze/15 text-bronze-glow"
                  : "border border-transparent text-foreground/50 hover:text-foreground/80",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-[0.62rem] uppercase tracking-[0.28em] text-foreground/50">
        {cycle === "annual" ? "Two months free" : "Switch to annual and save"}
      </p>
    </div>
  );
}
