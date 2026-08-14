import { cn } from "@/lib/utils";

/** Solid progress track. Announces progress to assistive tech. */
export function ProgressBar({
  value,
  total,
  className,
  label = "Quiz progress",
}: {
  value: number;
  total: number;
  className?: string;
  label?: string;
}) {
  const pct = total === 0 ? 0 : Math.min(100, Math.max(0, (value / total) * 100));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-valuetext={`${value} of ${total}`}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[oklch(0.24_0.008_60)]", className)}
    >
      <span
        className="block h-full rounded-full bg-gradient-bronze transition-[width] motion-snap"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
