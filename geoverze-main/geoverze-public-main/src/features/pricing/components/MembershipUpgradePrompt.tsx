import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { cn } from "@/lib/utils";

import { minTierLabel } from "../lib/entitlements";
import type { TierId } from "../data/plans";

type MembershipUpgradePromptProps = {
  requiredTier?: TierId;
  title?: string;
  description?: string;
  className?: string;
};

/** Shared locked-state CTA used by quizzes, Library, PvP and analytics. */
export function MembershipUpgradePrompt({
  requiredTier = "pro",
  title,
  description,
  className,
}: MembershipUpgradePromptProps) {
  const label = minTierLabel(requiredTier);
  return (
    <div
      className={cn(
        "mx-auto max-w-xl rounded-2xl border border-bronze/25 bg-charcoal/30 p-8 text-center",
        className,
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-bronze/35 bg-bronze/10 text-bronze-glow">
        <Lock className="h-5 w-5" strokeWidth={1.6} aria-hidden />
      </div>
      <p className="mt-6 text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
        Requires {label}
      </p>
      <h2 className="mt-3 text-2xl font-light tracking-tight text-foreground">
        {title ?? `Upgrade to ${label}`}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-foreground/60">
        {description ??
          `This benefit is included with ${label} membership. Your current plan does not unlock it yet.`}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <GeoButton asChild>
          <Link to="/pricing">View plans</Link>
        </GeoButton>
      </div>
    </div>
  );
}
