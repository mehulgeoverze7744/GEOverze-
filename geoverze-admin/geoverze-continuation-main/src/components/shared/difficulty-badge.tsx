import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  Easy: "border-success/30 bg-success/10 text-success",
  Medium: "border-info/30 bg-info/10 text-info",
  Hard: "border-warning/30 bg-warning/10 text-warning",
  Expert: "border-destructive/30 bg-destructive/10 text-destructive",
};

/** Shared difficulty chip used by the quiz catalogue and the question bank. */
export function DifficultyBadge({ level }: { level: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tone[level] ?? "border-border-strong bg-muted text-muted-foreground",
      )}
    >
      {level}
    </span>
  );
}
