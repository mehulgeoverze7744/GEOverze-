import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

/** Bronze lock chip for lookbook-only shelves. */
export function ComingSoonLockChip({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-bronze/45 bg-charcoal/80 text-bronze-glow backdrop-blur-sm",
        compact
          ? "px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.18em]"
          : "px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.2em]",
        className,
      )}
    >
      <Lock className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} strokeWidth={1.8} />
      Coming soon
    </span>
  );
}
