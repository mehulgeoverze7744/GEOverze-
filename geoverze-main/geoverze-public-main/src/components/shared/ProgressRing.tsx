import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Bronze progress ring.
 *
 * The stroke offset is animated imperatively on first reveal, matching the
 * platform's "no re-render on scroll" motion rule.
 */
export function ProgressRing({
  value,
  size = 96,
  thickness = 5,
  label,
  children,
  className,
}: {
  /** 0–100. */
  value: number;
  size?: number;
  thickness?: number;
  /** Accessible description of what the ring measures. */
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - clamped / 100);

  useEffect(() => {
    const node = circleRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.strokeDashoffset = `${target}`;
      return;
    }

    node.style.strokeDashoffset = `${circumference}`;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          requestAnimationFrame(() => {
            node.style.strokeDashoffset = `${target}`;
          });
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [circumference, target]);

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(clamped)}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-bronze/12"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="stroke-bronze transition-[stroke-dashoffset] duration-[1200ms] ease-[var(--ease-cinematic)] motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </span>
    </div>
  );
}
