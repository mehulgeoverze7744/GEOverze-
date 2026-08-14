import { cn } from "@/lib/utils";

import { GlassCard } from "./GlassCard";

function Bar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block animate-pulse rounded-full bg-bronze/10 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/**
 * Loading placeholders that match the platform's real surfaces.
 * `text` for copy blocks, `card` for a single glass panel, `list` for rows,
 * `grid` for a card grid.
 */
export function SkeletonBlock({
  variant = "text",
  count = 3,
  className,
}: {
  variant?: "text" | "card" | "list" | "grid";
  count?: number;
  className?: string;
}) {
  if (variant === "text") {
    return (
      <div className={cn("space-y-3", className)} aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <Bar
            key={i}
            className={cn("h-3", i === count - 1 ? "w-2/5" : i % 2 ? "w-4/5" : "w-full")}
          />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div
        className={cn("space-y-px overflow-hidden rounded-xl border border-bronze/12", className)}
        aria-hidden
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-charcoal/40 p-5">
            <Bar className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bar className="h-3 w-1/3" />
              <Bar className="h-2.5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)} aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonBlock key={i} variant="card" />
        ))}
      </div>
    );
  }

  return (
    <GlassCard className={cn("space-y-4 p-7", className)} aria-hidden>
      <Bar className="h-9 w-9 rounded-full" />
      <Bar className="h-3 w-1/2" />
      <Bar className="h-2.5 w-full" />
      <Bar className="h-2.5 w-4/5" />
    </GlassCard>
  );
}
