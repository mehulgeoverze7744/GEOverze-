import { Widget } from "@/components/shared/widget";
import type { ReportRow } from "@/features/ops/types";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Compact ranked breakdown used across the business-intelligence pages. */
export function ReportTable({
  title,
  description,
  rows,
  primaryLabel,
  secondaryLabel,
  limit = 8,
}: {
  title: string;
  description?: string | undefined;
  rows: ReportRow[];
  primaryLabel: string;
  secondaryLabel: string;
  limit?: number | undefined;
}) {
  const visible = rows.slice(0, limit);
  const max = Math.max(1, ...visible.map((row) => row.primary));

  return (
    <Widget title={title} description={description}>
      <ul className="divide-y divide-border">
        {visible.map((row, index) => (
          <li key={row.id} className="flex items-center gap-3 py-2">
            <span className="w-5 shrink-0 text-xs tabular text-muted-foreground">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{row.label}</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/50"
                  style={{ width: `${Math.round((row.primary / max) * 100)}%` }}
                />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm tabular text-foreground">
                {num(row.primary)}{" "}
                <span className="text-xs text-muted-foreground">{primaryLabel}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {num(row.secondary)} {secondaryLabel} ·{" "}
                <span className={cn(row.change >= 0 ? "text-success" : "text-destructive")}>
                  {row.change >= 0 ? "+" : ""}
                  {row.change}%
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Widget>
  );
}
