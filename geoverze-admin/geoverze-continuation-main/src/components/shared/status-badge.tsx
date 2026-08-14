import { cn } from "@/lib/utils";
import type { Status } from "@/types";

const tone: Record<string, string> = {
  active: "border-success/30 bg-success/10 text-success",
  published: "border-success/30 bg-success/10 text-success",
  paid: "border-success/30 bg-success/10 text-success",
  resolved: "border-success/30 bg-success/10 text-success",
  shipped: "border-info/30 bg-info/10 text-info",
  open: "border-info/30 bg-info/10 text-info",
  pending: "border-warning/30 bg-warning/10 text-warning",
  draft: "border-border-strong bg-muted text-muted-foreground",
  archived: "border-border-strong bg-muted text-muted-foreground",
  cancelled: "border-border-strong bg-muted text-muted-foreground",
  suspended: "border-destructive/30 bg-destructive/10 text-destructive",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  refunded: "border-warning/30 bg-warning/10 text-warning",
};

export function StatusBadge({ status }: { status: Status | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        tone[status] ?? "border-border-strong bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

export function SeverityBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Critical: "border-destructive/40 bg-destructive/10 text-destructive",
    High: "border-warning/40 bg-warning/10 text-warning",
    Medium: "border-info/40 bg-info/10 text-info",
    Low: "border-border-strong bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        map[level] ?? "border-border-strong bg-muted text-muted-foreground",
      )}
    >
      {level}
    </span>
  );
}
