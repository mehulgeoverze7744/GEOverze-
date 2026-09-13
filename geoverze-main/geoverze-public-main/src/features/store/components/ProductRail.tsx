import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatedSection } from "@/components/shared";
import { cn } from "@/lib/utils";

/** Section rail: title, optional "see all" link, grid or horizontal scroll. */
export function ProductRail({
  title,
  description,
  to,
  linkLabel = "See all",
  children,
  columns = 4,
  titleClassName,
  descriptionClassName,
  layout = "grid",
  scrollStepSelector = "[data-rail-item]",
}: {
  title: string;
  description?: string;
  to?: "/geostore/browse" | "/geostore/rewards" | "/geostore/offers" | "/geostore/orders";
  linkLabel?: string;
  children: ReactNode;
  columns?: 3 | 4;
  titleClassName?: string;
  descriptionClassName?: string;
  /** Horizontal carousel with bronze arrow controls. */
  layout?: "grid" | "scroll";
  scrollStepSelector?: string;
}) {
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
    if (layout !== "scroll") return;
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
  }, [layout, updateScrollState, children]);

  const nudge = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(scrollStepSelector);
    const step = item ? item.offsetWidth + 24 : Math.max(280, el.clientWidth * 0.82);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const arrowControls =
    layout === "scroll" ? (
      <div className="flex shrink-0 items-center gap-2">
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
                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-bronze/25 bg-charcoal/45 text-foreground/75 backdrop-blur transition-all motion-fast hover:scale-105 hover:border-bronze/50 hover:text-bronze-glow hover:shadow-[var(--glow-bronze)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 disabled:pointer-events-none disabled:opacity-35 motion-reduce:hover:scale-100",
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
    ) : null;

  return (
    <AnimatedSection
      className={cn("mt-[var(--space-section-sm)]", layout === "scroll" && "overflow-x-clip")}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2
            className={
              titleClassName ??
              "text-xl font-semibold tracking-tight text-foreground md:text-2xl"
            }
          >
            {title}
          </h2>
          {description ? (
            <p
              className={
                descriptionClassName ??
                "mt-2 max-w-xl text-xs leading-relaxed text-foreground/50"
              }
            >
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {to ? (
            <Link
              to={to}
              className="inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-bronze transition-colors motion-fast hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
            >
              {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
          {arrowControls}
        </div>
      </div>
      {layout === "scroll" ? (
        <div ref={railRef} className="rail-scroll mt-6 flex items-stretch gap-6 pb-1">
          {children}
        </div>
      ) : (
        <div
          className={
            columns === 3
              ? "mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          }
        >
          {children}
        </div>
      )}
    </AnimatedSection>
  );
}
