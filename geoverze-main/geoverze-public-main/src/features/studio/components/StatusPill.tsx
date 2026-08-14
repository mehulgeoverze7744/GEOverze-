import { cn } from "@/lib/utils";
import { STATUS_LABEL, type ContentStatus } from "../data/types";

const TONE: Record<ContentStatus, string> = {
  draft: "border-foreground/20 text-foreground/60",
  "in-review": "border-[oklch(0.72_0.12_75/0.5)] text-[oklch(0.85_0.11_80)]",
  scheduled: "border-[oklch(0.7_0.1_240/0.5)] text-[oklch(0.82_0.09_245)]",
  published: "border-[oklch(0.72_0.13_150/0.5)] text-[oklch(0.86_0.12_150)]",
  rejected: "border-[oklch(0.66_0.18_20/0.5)] text-[oklch(0.84_0.15_25)]",
  archived: "border-foreground/12 text-foreground/50",
};

/** Compact status chip used across every studio list. */
export function StatusPill({ status, className }: { status: ContentStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium",
        TONE[status],
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
