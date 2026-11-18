import { findAvatar } from "@/features/auth/data/onboarding";
import { cn } from "@/lib/utils";

/**
 * Explorer identity mark.
 *
 * Named presets resolve to the shared character portraits. Unknown ids keep
 * the generated bronze glyph so historical leaderboard rows never break.
 */
export function AvatarMark({
  id,
  size = 64,
  className,
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const avatar = findAvatar(id);
  const label = avatar?.label ?? "Avatar";

  if (avatar?.src) {
    return (
      <img
        src={avatar.src}
        alt={`${label} avatar`}
        width={size}
        height={size}
        decoding="async"
        draggable={false}
        className={cn("shrink-0 rounded-full bg-[#E5E5EA] object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const [from, to] = avatar?.hue ?? [62, 78];
  const gradientId = `avatar-${id}`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={`${label} avatar`}
      className={cn("shrink-0 rounded-full", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`oklch(0.72 0.1 ${from})`} />
          <stop offset="100%" stopColor={`oklch(0.42 0.06 ${to})`} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${gradientId})`} />
      <circle
        cx="32"
        cy="32"
        r="31"
        fill="none"
        stroke="oklch(0.9 0.05 80 / 0.35)"
        strokeWidth="1"
      />
      <circle cx="32" cy="32" r="22" fill="oklch(0.18 0.02 60 / 0.55)" />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
        fill="oklch(0.92 0.06 82)"
        aria-hidden="true"
      >
        {avatar?.glyph ?? "◉"}
      </text>
    </svg>
  );
}
