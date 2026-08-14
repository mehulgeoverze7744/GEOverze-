import { PartyPopper } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * Lightweight celebration burst. Confetti placeholder: CSS-driven bronze shards,
 * no library, and nothing renders when reduced motion is requested.
 */
export function Confetti({ pieces = 28 }: { pieces?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current && ref.current) ref.current.hidden = true;
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: pieces }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 h-3 w-1.5 rounded-sm bg-gradient-bronze opacity-0 animate-[fade-in_0.4s_ease-out_forwards]"
          style={{
            left: `${(i * 97) % 100}%`,
            animationDelay: `${(i % 10) * 60}ms`,
            transform: `translateY(${20 + ((i * 37) % 160)}px) rotate(${(i * 53) % 360}deg)`,
          }}
        />
      ))}
      <PartyPopper className="sr-only" />
    </div>
  );
}
