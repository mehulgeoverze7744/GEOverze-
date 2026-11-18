import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { UserAvatar } from "./UserAvatar";

export const EXPLORER_AVATAR_SIZES = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 112,
} as const;

export type ExplorerAvatarSize = keyof typeof EXPLORER_AVATAR_SIZES;

/**
 * Canonical GVRZE identity portrait. Every surface should resolve avatars
 * through this component (or UserAvatar) so the same mapping is used.
 */
export function ExplorerAvatar({
  avatarId,
  avatarUrl,
  size = "md",
  alt = "Explorer avatar",
  selected = false,
  online,
  bordered = false,
  priority = false,
  className,
}: {
  avatarId?: string | null;
  avatarUrl?: string | null;
  size?: ExplorerAvatarSize | number;
  alt?: string;
  selected?: boolean;
  online?: boolean;
  bordered?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const px = typeof size === "number" ? size : EXPLORER_AVATAR_SIZES[size];
  const ring = selected ? "ring-2 ring-[#007AFF] ring-offset-2 ring-offset-[#F5F5F7]" : null;

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: px, height: px }}
    >
      <UserAvatar
        avatarId={avatarId}
        avatarUrl={avatarUrl}
        size={px}
        alt={alt}
        priority={priority}
        className={cn(
          "h-full w-full rounded-full object-cover",
          bordered && "ring-1 ring-[#E5E5EA]",
          ring,
        )}
      />
      {selected ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-sm">
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        </span>
      ) : null}
      {online ? (
        <span
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#34C759]"
          title="Online"
        />
      ) : null}
    </span>
  );
}
