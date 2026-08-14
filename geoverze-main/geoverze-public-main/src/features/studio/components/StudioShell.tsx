import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/studioStore";
import { StudioSidebar } from "./StudioSidebar";
import { StudioTopbar } from "./StudioTopbar";

/**
 * The Creator Studio workspace: fixed rail, sticky top bar, scrolling main
 * column and an optional right context panel on wide screens.
 *
 * Desktop-first by design — below `xl` the context panel stacks under the
 * main column, and below `md` the rail collapses out of the flow.
 */
export function StudioShell({
  children,
  context,
  className,
}: {
  children: ReactNode;
  context?: ReactNode;
  className?: string;
}) {
  const contextOpen = useStudioStore((s) => s.contextPanelOpen);
  const showContext = Boolean(context) && contextOpen;

  return (
    <div className="flex min-h-dvh w-full">
      <StudioSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <StudioTopbar />

        <div className="flex min-w-0 flex-1 flex-col xl:flex-row">
          <div className={cn("min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8", className)}>
            {children}
          </div>

          {context ? (
            <aside
              aria-label="Context panel"
              className={cn(
                "shrink-0 border-bronze/12 px-4 pb-10 md:px-8 xl:w-[20rem] xl:border-l xl:px-6 xl:py-8",
                showContext ? "block" : "hidden",
              )}
            >
              {context}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Page heading inside the workspace. Compact, product-grade. */
export function StudioHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-7 flex flex-wrap items-end justify-between gap-4 md:flex-nowrap",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-[0.62rem] uppercase tracking-[0.28em] text-bronze/90">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[1.5rem] font-semibold tracking-tight text-foreground md:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-foreground/50">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
