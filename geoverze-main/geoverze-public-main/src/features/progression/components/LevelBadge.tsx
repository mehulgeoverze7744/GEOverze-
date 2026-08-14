import { cn } from "@/lib/utils";

/**
 * Bronze level chip. Solid fill, game-surface language.
 */
export function LevelBadge({
  level,
  title,
  size = "md",
  className,
}: {
  level: number;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim =
    size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-base";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-bronze font-semibold text-background shadow-[var(--shadow-game)]",
          dim,
        )}
        aria-hidden="true"
      >
        {level}
      </span>
      <span className="min-w-0">
        <span className="sr-only">Level {level}</span>
        <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
          Level {level}
        </span>
        {title ? (
          <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
        ) : null}
      </span>
    </span>
  );
}
