import { cn } from "@/lib/utils";

/**
 * Keyboard-operable single-select filter row. Purely presentational: the
 * caller owns state, so the same component drives history, achievements etc.
 */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  /** Accessible group label. */
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)} role="group" aria-label={label}>
      <p className="text-[0.58rem] uppercase tracking-[0.24em] text-foreground/50">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] transition-all motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                active
                  ? "border-bronze/60 bg-bronze/15 text-bronze-glow"
                  : "border-bronze/15 text-foreground/50 hover:border-bronze/35 hover:text-foreground/80",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
