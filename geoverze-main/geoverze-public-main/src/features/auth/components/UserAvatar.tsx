import { useState } from "react";

import { cn } from "@/lib/utils";

import { AvatarMark } from "./AvatarMark";
import {
  DEFAULT_ASTRONAUT_AVATAR_SRC,
  defaultAstronautDisplaySize,
  resolveUserAvatar,
} from "../lib/avatar";

function ExplorerAstronautAvatar({
  size,
  className,
  alt,
  priority = false,
}: {
  size: number;
  className?: string;
  alt: string;
  priority?: boolean;
}) {
  const display = defaultAstronautDisplaySize(size);
  const decodeEdge = Math.max(display.width * 4, 512);

  return (
    <span
      className={cn(
        "user-avatar-explorer relative inline-flex shrink-0 overflow-visible",
        className,
      )}
      style={{ width: display.width, height: display.height }}
    >
      <img
        src={DEFAULT_ASTRONAUT_AVATAR_SRC}
        alt={alt}
        width={decodeEdge}
        height={decodeEdge}
        sizes={`${Math.max(display.width, size) * 2}px`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        className="h-full w-full object-contain object-center drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]"
      />
    </span>
  );
}

/**
 * Current-user avatar with centralized fallback to the default astronaut window.
 *
 * Preset glyph avatars (leaderboards, credit history, onboarding gallery)
 * should continue using {@link AvatarMark} directly.
 */
export function UserAvatar({
  avatarUrl,
  avatarId,
  size = 64,
  className,
  alt = "Profile avatar",
  priority = false,
}: {
  avatarUrl?: string | null;
  avatarId?: string | null;
  size?: number;
  className?: string;
  alt?: string;
  /** Eager-load a high-resolution decode suitable for 2× hover frames. */
  priority?: boolean;
}) {
  const resolved = resolveUserAvatar({
    avatarUrl: avatarUrl ?? null,
    avatarId: avatarId ?? null,
  });
  const [imageFailed, setImageFailed] = useState(false);
  const decodeEdge = Math.max(size * 4, 512);
  const sizesPx = Math.max(size * 2, 128);

  if (resolved.kind === "mark") {
    return <AvatarMark id={resolved.id} size={size} className={className ?? ""} />;
  }

  if (resolved.kind === "default" || imageFailed) {
    return (
      <ExplorerAstronautAvatar
        size={size}
        className={className ?? ""}
        alt={alt}
        priority={priority}
      />
    );
  }

  return (
    <img
      src={resolved.src}
      alt={alt}
      width={decodeEdge}
      height={decodeEdge}
      sizes={`${sizesPx}px`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
      className={cn("shrink-0 rounded-full bg-transparent object-cover", className)}
      onError={() => {
        setImageFailed(true);
      }}
    />
  );
}
