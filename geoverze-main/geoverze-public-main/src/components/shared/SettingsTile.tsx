import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * One row inside a settings panel: label, help text and a control slot.
 * Used for switches, selects, inline buttons and read-only status rows.
 */
export function SettingsTile({
  icon: Icon,
  label,
  description,
  control,
  children,
  tone = "default",
  className,
}: {
  icon?: LucideIcon;
  label: string;
  description?: string;
  /** Right-aligned control (switch, select, button). */
  control?: ReactNode;
  /** Full-width content rendered under the label block. */
  children?: ReactNode;
  tone?: "default" | "danger";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-b border-bronze/10 pb-6 last:border-0 last:pb-0",
        tone === "danger" && "rounded-2xl border border-destructive/25 bg-destructive/5 p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="flex min-w-0 gap-3">
          {Icon ? (
            <span
              className={cn(
                "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
                tone === "danger"
                  ? "border-destructive/30 text-destructive"
                  : "border-bronze/20 text-bronze/90",
              )}
              aria-hidden="true"
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-sm text-foreground/85">{label}</p>
            {description ? (
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/50">{description}</p>
            ) : null}
          </div>
        </div>
        {control ? <div className="shrink-0 sm:mt-1">{control}</div> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
