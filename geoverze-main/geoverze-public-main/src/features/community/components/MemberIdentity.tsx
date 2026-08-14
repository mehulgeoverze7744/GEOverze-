import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { memberByHandle } from "../data/members";
import { MemberAvatar } from "./MemberAvatar";
import { TierBadge, VerifiedMark } from "./TierBadge";

/**
 * Author line: avatar, name, handle, country and an optional timestamp slot.
 * Used at the top of every post and in every member list row.
 */
export function MemberIdentity({
  handle,
  meta,
  size = "sm",
  showTier = false,
  className,
}: {
  handle: string;
  /** Right-hand-side text under the name, e.g. relative time. */
  meta?: string;
  size?: "sm" | "md" | "lg";
  showTier?: boolean;
  className?: string;
}) {
  const member = memberByHandle(handle);
  if (!member) return null;

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <MemberAvatar handle={handle} size={size === "lg" ? "md" : size} showPresence />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            to="/community/member/$handle"
            params={{ handle }}
            className="truncate text-sm font-medium text-foreground transition-colors motion-snap hover:text-bronze-glow"
          >
            {member.name}
          </Link>
          {member.verified ? <VerifiedMark /> : null}
          {showTier ? <TierBadge tier={member.tier} className="ml-1" /> : null}
        </div>
        <p className="truncate text-[0.7rem] text-foreground/50">
          <span aria-hidden className="mr-1">
            {member.flag}
          </span>
          @{member.handle}
          {meta ? <span className="mx-1.5 text-foreground/50">·</span> : null}
          {meta}
        </p>
      </div>
    </div>
  );
}
