import { cn } from "@/lib/utils";

/**
 * Bronze radar sweep used by the matchmaking screen. Decorative only — the
 * rings are CSS, and every animation stops under reduced-motion.
 */
export function RadarPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative grid h-44 w-44 place-items-center", className)}
      role="img"
      aria-label="Searching for an opponent"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="pulse absolute inset-0 rounded-full border border-bronze/40 motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.6}s`, transform: `scale(${1 - i * 0.18})` }}
        />
      ))}
      <span className="absolute inset-8 rounded-full border border-bronze/25" />
      <span className="absolute inset-16 rounded-full border border-bronze/20" />
      <span className="absolute inset-0 animate-spin rounded-full [animation-duration:3.2s] motion-reduce:animate-none">
        <span className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom bg-gradient-to-t from-transparent to-bronze" />
      </span>
      <span className="relative h-3 w-3 rounded-full bg-bronze shadow-[0_0_18px_var(--color-bronze)]" />
    </div>
  );
}
