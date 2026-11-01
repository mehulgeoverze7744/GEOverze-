import { cn } from "@/lib/utils";
import type { Difficulty } from "../data/categories";

const TONE: Record<Difficulty, string> = {
  Easy: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Medium: "border-amber-200 bg-amber-50 text-amber-800",
  Hard: "border-orange-200 bg-orange-50 text-orange-800",
  Expert: "border-rose-200 bg-rose-50 text-rose-800",
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
          ? "border-[#2b74c4]/30 bg-[#2b74c4]/10 text-[#2b74c4]"
          : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
        className,
      )}
    >
      {children}
    </span>
  );
}
