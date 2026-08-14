import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface ToolbarAction {
  label: string;
  onSelect: () => void;
  icon?: ReactNode | undefined;
  variant?: "default" | "outline" | "ghost" | "destructive" | undefined;
  disabled?: boolean | undefined;
}

export interface ActionToolbarProps {
  /** Left-side content, typically a search bar. */
  children?: ReactNode | undefined;
  actions?: ToolbarAction[] | undefined;
  /** When > 0 the toolbar switches to bulk-selection mode. */
  selectedCount?: number | undefined;
  bulkActions?: ToolbarAction[] | undefined;
  onClearSelection?: (() => void) | undefined;
  className?: string | undefined;
}

export function ActionToolbar({
  children,
  actions,
  selectedCount = 0,
  bulkActions,
  onClearSelection,
  className,
}: ActionToolbarProps) {
  const bulkMode = selectedCount > 0 && (bulkActions?.length ?? 0) > 0;

  return (
    <div
      role="toolbar"
      aria-label={bulkMode ? "Bulk actions" : "Page actions"}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2",
        bulkMode && "border-primary/40 bg-primary/5",
        className,
      )}
    >
      {bulkMode ? (
        <>
          <span className="text-sm font-medium tabular text-foreground">
            {selectedCount} selected
          </span>
          <Separator orientation="vertical" className="mx-1 h-5" />
          {bulkActions?.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant ?? "outline"}
              disabled={action.disabled}
              onClick={action.onSelect}
              className="h-8"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          {onClearSelection && (
            <Button variant="ghost" size="sm" className="ml-auto h-8" onClick={onClearSelection}>
              Clear
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="min-w-0 flex-1">{children}</div>
          {actions?.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant ?? "outline"}
              disabled={action.disabled}
              onClick={action.onSelect}
              className="h-8"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </>
      )}
    </div>
  );
}
