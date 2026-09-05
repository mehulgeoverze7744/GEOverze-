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
}: {
  size: number;
  className?: string;
  alt: string;
}) {
  const display = defaultAstronautDisplaySize(size);

  return (
    <span
      className={cn("user-avatar-explorer relative inline-flex shrink-0 overflow-visible", className)}
      style={{ width: display.width, height: display.height }}
    >
      <img
        src={DEFAULT_ASTRONAUT_AVATAR_SRC}
        alt={alt}
        width={display.width}
        height={display.height}
        loading="lazy"
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
}: {
  avatarUrl?: string | null;
  avatarId?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}) {
  const resolved = resolveUserAvatar({ avatarUrl, avatarId });
  const [imageFailed, setImageFailed] = useState(false);

  if (resolved.kind === "mark") {
    return <AvatarMark id={resolved.id} size={size} className={className} />;
  }

  if (resolved.kind === "default" || imageFailed) {
    return <ExplorerAstronautAvatar size={size} className={className} alt={alt} />;
  }

  return (
    <img
      src={resolved.src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn("shrink-0 rounded-full object-cover", className)}
      onError={() => {
        setImageFailed(true);
      }}
    />
  );
}
