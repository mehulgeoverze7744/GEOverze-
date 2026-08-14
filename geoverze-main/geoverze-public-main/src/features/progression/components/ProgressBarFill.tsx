import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Animated progress bar used for XP, credits and challenges.
 *
 * The width is written imperatively on reveal, so filling never re-renders
 * React. Honours reduced motion.
 */
export function ProgressBarFill({
  value,
  label,
  valueText,
  tone = "bronze",
  size = "md",
  className,
}: {
  /** 0–100. */
  value: number;
  label: string;
  valueText?: string;
  tone?: "bronze" | "flame" | "muted";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const clamped = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.width = `${clamped}%`;
      return;
    }

    node.style.width = "0%";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          requestAnimationFrame(() => {
            node.style.width = `${clamped}%`;
          });
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [clamped]);

  const height = size === "lg" ? "h-3" : size === "sm" ? "h-1.5" : "h-2";
  const fill =
    tone === "flame"
      ? "bg-[linear-gradient(90deg,oklch(0.7_0.16_45),oklch(0.84_0.13_78))]"
      : tone === "muted"
        ? "bg-bronze/40"
        : "bg-gradient-bronze";

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-[oklch(0.22_0.008_60)]",
        height,
        className,
      )}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={valueText ?? `${Math.round(clamped)}%`}
    >
      <span
        ref={ref}
        className={cn(
          "block h-full rounded-full transition-[width] duration-[1100ms] ease-[var(--ease-cinematic)] motion-reduce:transition-none",
          fill,
        )}
        style={{ width: 0 }}
      />
    </div>
  );
}
