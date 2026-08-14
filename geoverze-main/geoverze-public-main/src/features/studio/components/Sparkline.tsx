import { cn } from "@/lib/utils";
import type { SeriesPoint } from "../data/types";

/** Inline SVG sparkline. No chart library, no runtime cost. */
export function Sparkline({
  points,
  className,
  height = 40,
}: {
  points: SeriesPoint[];
  className?: string;
  height?: number;
}) {
  if (points.length < 2) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = 100 / (points.length - 1);

  const coords = values.map((v, i) => {
    const x = i * step;
    const y = 100 - ((v - min) / span) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const line = `M ${coords.join(" L ")}`;
  const area = `${line} L 100,100 L 0,100 Z`;
  const gradientId = `spark-${points.length}-${Math.round(max)}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      role="img"
      aria-label="Trend over the selected period"
      className={cn("w-full", className)}
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.68 0.09 62 / 0.35)" />
          <stop offset="100%" stopColor="oklch(0.68 0.09 62 / 0)" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="oklch(0.78 0.09 68)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Vertical bar chart for period comparisons. */
export function BarSeries({
  points,
  className,
  height = 160,
}: {
  points: SeriesPoint[];
  className?: string;
  height?: number;
}) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <div className={cn("flex items-end gap-1", className)} style={{ height }} aria-hidden>
      {points.map((p, i) => (
        <div
          key={`${p.label}-${i}`}
          title={`${p.label}: ${p.value}`}
          className="flex-1 rounded-t-sm bg-gradient-to-t from-bronze/15 to-bronze/70 transition-[height] motion-base"
          style={{ height: `${Math.max(4, (p.value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

/** Horizontal share bars — used for traffic sources and revenue splits. */
export function ShareBars({
  points,
  className,
  suffix = "%",
}: {
  points: SeriesPoint[];
  className?: string;
  suffix?: string;
}) {
  const total = points.reduce((n, p) => n + p.value, 0) || 1;

  return (
    <ul className={cn("space-y-3", className)}>
      {points.map((p) => {
        const share = (p.value / total) * 100;
        return (
          <li key={p.label}>
            <div className="mb-1.5 flex items-baseline justify-between text-[0.78rem]">
              <span className="text-foreground/70">{p.label}</span>
              <span className="text-foreground/50">
                {p.value}
                {suffix}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bronze/10">
              <div
                className="h-full rounded-full bg-gradient-bronze"
                style={{ width: `${share}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
