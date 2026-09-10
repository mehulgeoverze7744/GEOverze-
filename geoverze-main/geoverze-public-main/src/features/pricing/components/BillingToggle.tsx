import { cn } from "@/lib/utils";

import type { BillingCycle } from "../data/plans";

import "../../marketing/components/home-hero.css";

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
        className="inline-flex items-center gap-1.5 rounded-full border border-bronze/15 bg-charcoal/40 p-1"
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
                "min-h-10 min-w-[5.5rem] rounded-full px-5 text-[0.65rem] font-bold uppercase tracking-[var(--tracking-button)] transition-all motion-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                active
                  ? "home-hero-cta shadow-none"
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
