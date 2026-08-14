import { cn } from "@/lib/utils";
import type { Difficulty } from "../data/categories";

const TONE: Record<Difficulty, string> = {
  Easy: "border-[oklch(0.72_0.13_150/0.45)] text-[oklch(0.82_0.13_150)] bg-[oklch(0.72_0.13_150/0.12)]",
  Medium:
    "border-[oklch(0.78_0.13_90/0.45)] text-[oklch(0.86_0.13_90)] bg-[oklch(0.78_0.13_90/0.12)]",
  Hard: "border-[oklch(0.72_0.15_45/0.5)] text-[oklch(0.84_0.14_50)] bg-[oklch(0.72_0.15_45/0.14)]",
  Expert:
    "border-[oklch(0.66_0.18_20/0.5)] text-[oklch(0.8_0.16_25)] bg-[oklch(0.66_0.18_20/0.14)]",
};

/** Small solid difficulty chip. */
export function DifficultyBadge({ level, className }: { level: Difficulty; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em]",
        TONE[level],
        className,
      )}
    >
      {level}
    </span>
  );
}

/** Neutral meta chip (New, Trending, counts). */
export function MetaChip({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "bronze";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em]",
        tone === "bronze"
          ? "border-bronze/50 bg-bronze/15 text-bronze-glow"
          : "border-bronze/12 bg-[oklch(0.22_0.008_60)] text-foreground/60",
        className,
      )}
    >
      {children}
    </span>
  );
}
