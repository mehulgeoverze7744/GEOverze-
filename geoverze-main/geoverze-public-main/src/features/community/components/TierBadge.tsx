import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

import { TIER_LABEL, type MembershipTier } from "../data/members";

const TIER_STYLE: Record<MembershipTier, string> = {
  explorer: "border-foreground/15 text-foreground/55",
  navigator: "border-bronze/30 text-bronze/85",
  cartographer: "border-bronze/45 text-bronze-glow",
  creator: "border-bronze/60 bg-bronze/10 text-bronze-glow",
};

/** Membership tier chip. */
export function TierBadge({ tier, className }: { tier: MembershipTier; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.18em]",
        TIER_STYLE[tier],
        className,
      )}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

/** Verified marker shown beside a member name. */
export function VerifiedMark({ className }: { className?: string }) {
  return (
    <span title="Verified explorer" className={cn("inline-flex text-bronze", className)}>
      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.6} />
      <span className="sr-only">Verified</span>
    </span>
  );
}
