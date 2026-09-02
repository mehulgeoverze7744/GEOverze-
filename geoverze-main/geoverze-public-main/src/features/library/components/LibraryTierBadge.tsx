import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  libraryTierLabel,
  libraryTierRequiresLabel,
  type LibraryAccessTier,
  type ResourceAccessState,
} from "../lib/access-tier";

type LibraryTierBadgeProps = {
  tier: LibraryAccessTier;
  accessState?: ResourceAccessState;
  className?: string;
  showLock?: boolean;
};

/** Subtle membership tier badge for library cards and article headers. */
export function LibraryTierBadge({
  tier,
  accessState,
  className,
  showLock = false,
}: LibraryTierBadgeProps) {
  const restricted = accessState != null && accessState.kind !== "open";
  const label = restricted ? libraryTierRequiresLabel(tier) : libraryTierLabel(tier);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em]",
        restricted
          ? "border-bronze/35 bg-[oklch(0.12_0.006_60/0.85)] text-foreground/55"
          : "border-bronze/45 bg-bronze/12 text-bronze-glow",
        className,
      )}
    >
      {(showLock || restricted) && (
        <Lock className="h-3 w-3 shrink-0" strokeWidth={1.8} aria-hidden />
      )}
      {label}
    </span>
  );
}
