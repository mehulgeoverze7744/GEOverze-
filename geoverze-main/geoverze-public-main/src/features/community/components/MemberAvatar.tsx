import { Link } from "@tanstack/react-router";

import { ExplorerAvatar, type ExplorerAvatarSize } from "@/features/auth/components/ExplorerAvatar";
import { explorerAvatarIdFromHandle } from "@/features/auth/lib/avatar";
import { cn } from "@/lib/utils";

import { memberByHandle } from "../data/members";

const SIZES: Record<string, ExplorerAvatarSize> = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

/**
 * Community member portrait. Placeholder people map deterministically onto
 * the eight explorer characters until community accounts are live.
 */
export function MemberAvatar({
  handle,
  size = "sm",
  linked = true,
  showPresence = false,
  className,
  avatarId,
  avatarUrl,
}: {
  handle: string;
  size?: keyof typeof SIZES;
  linked?: boolean;
  showPresence?: boolean;
  className?: string;
  avatarId?: string | null;
  avatarUrl?: string | null;
}) {
  const member = memberByHandle(handle);
  const label = member?.name ?? handle;
  const resolvedId = avatarId?.trim() || explorerAvatarIdFromHandle(handle);

  const avatar = (
    <ExplorerAvatar
      avatarId={resolvedId}
      avatarUrl={avatarUrl}
      size={SIZES[size] ?? "sm"}
      alt={label}
      online={showPresence && member?.online}
      className={className}
    />
  );

  if (!linked) return avatar;

  return (
    <Link
      to="/community/member/$handle"
      params={{ handle }}
      className={cn(
        "rounded-full transition-opacity motion-snap hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
      )}
      aria-label={label}
    >
      {avatar}
    </Link>
  );
}
