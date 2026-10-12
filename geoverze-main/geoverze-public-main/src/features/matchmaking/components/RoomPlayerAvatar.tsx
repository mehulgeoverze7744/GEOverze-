import { cn } from "@/lib/utils";
import { AvatarMark } from "@/features/auth/components/AvatarMark";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import {
  DEFAULT_ASTRONAUT_AVATAR_SRC,
  isBundledAvatarSrc,
  normalizeParticipantAvatar,
  resolveParticipantAvatarFields,
  resolveUserAvatar,
} from "@/features/auth/lib/avatar";

type RoomPlayerAvatarProps = {
  avatarId?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  alt?: string | undefined;
  className?: string | undefined;
  /** Banner fills the player-card header; chip is the compact roster mark. */
  variant?: "banner" | "chip";
  size?: number;
};

/** Shared profile avatar for Let's Play room cards and player lists. */
export function RoomPlayerAvatar({
  avatarId,
  avatarUrl,
  alt = "Player avatar",
  className,
  variant = "chip",
  size = 40,
}: RoomPlayerAvatarProps) {
  const fields = normalizeParticipantAvatar({
    avatarId: avatarId ?? null,
    avatarUrl: avatarUrl ?? null,
  });

  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 overflow-hidden rounded-full border border-bronze/35 bg-[oklch(0.16_0.008_60)] shadow-[0_0_0_1px_oklch(0.62_0.08_72/0.18),0_0_16px_oklch(0.62_0.08_72/0.12)]",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <UserAvatar
          avatarId={fields.avatarId}
          avatarUrl={fields.avatarUrl}
          size={size}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
        />
      </span>
    );
  }

  const resolved = resolveUserAvatar(fields);
  const photoCover = resolved.kind === "url" && !isBundledAvatarSrc(resolved.src);

  return (
    <div
      className={cn(
        "relative h-24 overflow-hidden bg-[oklch(0.14_0.008_60)] shadow-[inset_0_0_0_1px_oklch(0.62_0.08_72/0.28)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.62_0.08_72/0.16),transparent_62%)]"
      />
      {resolved.kind === "mark" ? (
        <div className="relative flex h-full items-center justify-center">
          <AvatarMark id={resolved.id} size={56} className="border border-bronze/30" />
        </div>
      ) : (
        <img
          src={resolved.kind === "default" ? DEFAULT_ASTRONAUT_AVATAR_SRC : resolved.src}
          alt={alt}
          className={cn(
            "relative h-full w-full",
            photoCover ? "object-cover object-center" : "object-contain object-center p-1.5",
          )}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      )}
    </div>
  );
}

/** Resolve a room participant's avatar, overlaying the signed-in user's session. */
export function ParticipantAvatar({
  participant,
  you,
  selfAvatar,
  variant = "chip",
  size = 40,
  alt = "Player avatar",
  className,
}: {
  participant: { avatar_id?: string | null | undefined; avatar_url?: string | null | undefined };
  you?: boolean;
  selfAvatar?: { avatarId?: string | null | undefined; avatarUrl?: string | null | undefined };
  variant?: "banner" | "chip";
  size?: number;
  alt?: string;
  className?: string;
}) {
  const fields = resolveParticipantAvatarFields(participant, { you, selfAvatar });
  return (
    <RoomPlayerAvatar
      avatarId={fields.avatarId}
      avatarUrl={fields.avatarUrl}
      variant={variant}
      size={size}
      alt={alt}
      className={className}
    />
  );
}
