import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/shared/breadcrumbs";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  /** Route-derived by default; pass `null` to hide. */
  breadcrumbs?: Crumb[] | null | undefined;
  /** Tabs or secondary nav rendered under the title block. */
  children?: ReactNode | undefined;
  className?: string | undefined;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3 border-b border-border pb-4", className)}>
      {breadcrumbs !== null && <Breadcrumbs items={breadcrumbs ?? undefined} />}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
