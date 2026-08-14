import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/** Horizontal step indicator with animated progress rail. */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: readonly string[];
  current: number;
  className?: string;
}) {
  const percent = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 100;

  return (
    <div className={className}>
      <ol className="flex items-center gap-2" aria-label="Onboarding progress">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full border text-[0.62rem] transition-all motion-base motion-reduce:transition-none",
                  done && "border-bronze/60 bg-bronze/20 text-bronze-glow",
                  active &&
                    "border-bronze bg-bronze/25 text-bronze-glow shadow-[var(--glow-bronze)]",
                  !done && !active && "border-bronze/15 text-foreground/50",
                )}
              >
                {done ? (
                  <Check className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden text-[0.58rem] uppercase tracking-[0.2em] sm:block",
                  active ? "text-foreground/70" : "text-foreground/50",
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
      <ProgressBar
        value={percent}
        className="mt-4"
        label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
      />
    </div>
  );
}

/** Bronze progress rail. */
export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
      className={cn("h-0.5 w-full overflow-hidden rounded-full bg-charcoal/70", className)}
    >
      <span
        className="block h-full rounded-full bg-bronze transition-all motion-slow motion-reduce:transition-none"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** Selectable card used for interests (multi) and skill level (single). */
export function ChoiceCard({
  selected,
  onSelect,
  role = "checkbox",
  title,
  description,
  icon,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  role?: "checkbox" | "radio";
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all motion-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 motion-reduce:transition-none",
        selected
          ? "border-bronze/60 bg-bronze/10 shadow-[var(--glow-bronze)]"
          : "border-bronze/15 bg-charcoal/40 hover:-translate-y-0.5 hover:border-bronze/35",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors motion-base",
            selected
              ? "border-bronze/50 bg-bronze/15 text-bronze-glow"
              : "border-bronze/15 text-bronze/90",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-light tracking-tight",
            selected ? "text-foreground" : "text-foreground/80",
          )}
        >
          {title}
        </span>
        {description ? (
          <span className="mt-1 block text-xs leading-relaxed text-foreground/50">
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center border transition-all motion-fast",
          role === "radio" ? "rounded-full" : "rounded-md",
          selected ? "border-bronze bg-bronze/25 text-bronze-glow" : "border-bronze/20",
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="h-2.5 w-2.5" strokeWidth={2.6} /> : null}
      </span>
    </button>
  );
}
