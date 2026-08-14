import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface StatGridProps {
  children: ReactNode;
  /** Maximum columns on the widest breakpoint. */
  columns?: 3 | 4 | 5 | 7 | undefined;
  label?: string | undefined;
  className?: string | undefined;
}

const columnClasses = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  7: "grid-cols-2 md:grid-cols-4 xl:grid-cols-7",
} as const;

/** Single responsive grid used by every KPI row in the dashboard. */
export function StatGrid({ children, columns = 4, label, className }: StatGridProps) {
  return (
    <section aria-label={label} className={cn("grid gap-3", columnClasses[columns], className)}>
      {children}
    </section>
  );
}
