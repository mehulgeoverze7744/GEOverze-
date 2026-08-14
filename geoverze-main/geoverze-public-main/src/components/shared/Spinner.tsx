import { cn } from "@/lib/utils";

/** Bronze hairline spinner used by every pending state. */
export function Spinner({
  className,
  label = "Loading",
  size = "md",
}: {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dimension = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)}>
      <span
        className={cn(
          "animate-spin rounded-full border border-bronze/20 border-t-bronze motion-reduce:animate-none",
          dimension,
        )}
      />
    </span>
  );
}
