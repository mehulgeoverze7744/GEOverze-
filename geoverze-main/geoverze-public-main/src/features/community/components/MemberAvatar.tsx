import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { avatarTint, memberByHandle } from "../data/members";
import { initials } from "../lib/format";

const SIZES = {
  xs: "h-7 w-7 text-[0.6rem]",
  sm: "h-9 w-9 text-[0.68rem]",
  md: "h-11 w-11 text-xs",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-2xl",
} as const;

/**
 * Deterministic gradient avatar for a member handle. No image bytes: the tint
 * is derived from the handle so avatars stay stable across sessions.
 */
export function MemberAvatar({
  handle,
  size = "sm",
  linked = true,
  showPresence = false,
  className,
}: {
  handle: string;
  size?: keyof typeof SIZES;
  linked?: boolean;
  showPresence?: boolean;
  className?: string;
}) {
  const member = memberByHandle(handle);
  const tint = avatarTint(handle);
  const label = member?.name ?? handle;

  const avatar = (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-bronze/25 font-medium uppercase tracking-wider text-foreground/90",
          SIZES[size],
        )}
        style={{ backgroundImage: `linear-gradient(140deg, ${tint.from}, ${tint.to})` }}
      >
        {initials(label)}
      </span>
      {showPresence && member?.online ? (
        <span
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-bronze"
          title="Online"
        />
      ) : null}
      <span className="sr-only">{label}</span>
    </span>
  );

  if (!linked) return avatar;

  return (
    <Link
      to="/community/member/$handle"
      params={{ handle }}
      className="rounded-full transition-opacity motion-snap hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
      aria-label={label}
    >
      {avatar}
    </Link>
  );
}
