import type { ReactNode } from "react";

import { PageTransition } from "@/components/shared/PageTransition";
import { cn } from "@/lib/utils";

/**
 * Standard shell for every non-Home page: navbar clearance, page transition,
 * and consistent bottom rhythm. The universe background and chrome live in the
 * root route, so pages only describe their own content.
 */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <PageTransition>
      <div className={cn("pb-[var(--space-section-sm)]", className)}>{children}</div>
    </PageTransition>
  );
}
