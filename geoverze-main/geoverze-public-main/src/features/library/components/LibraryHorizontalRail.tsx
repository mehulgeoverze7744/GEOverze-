import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { AnimatedSection } from "@/components/shared";
import { cn } from "@/lib/utils";

type LibraryHorizontalRailProps = {
  title: string;
  description?: string;
  className?: string;
  viewAllTo?: "/geolibrary/browse" | "/geolibrary/collections";
  viewAllSearch?: Record<string, unknown>;
  viewAllLabel?: string;
  scrollStepSelector?: string;
  children: ReactNode;
};

/** Horizontally scrollable GEOlibrary section with bronze arrow controls. */
export function LibraryHorizontalRail({
  title,
  description,
  className,
  viewAllTo,
  viewAllSearch,
  viewAllLabel = "View all",
  scrollStepSelector = "[data-rail-item]",
  children,
}: LibraryHorizontalRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, children]);

  const nudge = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(scrollStepSelector);
    const step = item ? item.offsetWidth + 16 : Math.max(280, el.clientWidth * 0.82);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <AnimatedSection className={cn("mt-16 min-w-0", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg font-light tracking-tight text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-foreground/50">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {viewAllTo ? (
            <Link
              to={viewAllTo}
              {...(viewAllSearch ? { search: viewAllSearch } : {})}
              className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-bronze transition-colors motion-fast hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
            >
              {viewAllLabel}
            </Link>
          ) : null}
          {([-1, 1] as const).map((dir) => {
            const disabled = dir === -1 ? !canScrollLeft : !canScrollRight;
            return (
              <button
                key={dir}
                type="button"
                disabled={disabled}
                onClick={() => nudge(dir)}
                aria-label={dir === -1 ? `Scroll ${title} left` : `Scroll ${title} right`}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-bronze/25 bg-charcoal/45 text-foreground/75 backdrop-blur transition-all motion-fast hover:border-bronze/50 hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 disabled:pointer-events-none disabled:opacity-35",
                )}
              >
                {dir === -1 ? (
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                ) : (
                  <ChevronRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 max-w-full">
        <div ref={railRef} className="rail-scroll mt-6 flex w-full min-w-0 items-stretch gap-4 pb-1">
          {children}
        </div>
      </div>
    </AnimatedSection>
  );
}
