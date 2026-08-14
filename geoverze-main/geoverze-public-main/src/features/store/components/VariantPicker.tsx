import { cn } from "@/lib/utils";

import type { Product } from "../data/products";

/** Variant selector for sized or coloured merchandise. */
export function VariantPicker({
  product,
  value,
  onChange,
  className,
}: {
  product: Product;
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  className?: string;
}) {
  if (product.options.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {product.options.map((option) => (
        <div key={option.label} role="group" aria-label={option.label}>
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">
            {option.label}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {option.values.map((entry) => {
              const active = value[option.label] === entry;
              return (
                <button
                  key={entry}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...value, [option.label]: entry })}
                  className={cn(
                    "rounded-lg border px-3.5 py-2 text-xs transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                    active
                      ? "border-bronze/60 bg-bronze/15 text-bronze-glow"
                      : "border-bronze/15 text-foreground/60 hover:border-bronze/40 hover:text-foreground",
                  )}
                >
                  {entry}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
