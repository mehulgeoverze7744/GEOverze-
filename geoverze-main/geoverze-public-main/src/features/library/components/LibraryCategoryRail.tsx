import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatedSection } from "@/components/shared";
import { cn } from "@/lib/utils";

import { CATEGORIES, type CategoryId } from "../data/taxonomy";
import { libraryCategoryTileClass } from "../lib/library-rail-layout";

function categoryBrowseSearch(categoryId: CategoryId) {
  return {
    q: "",
    continent: "all" as const,
    difficulty: "all" as const,
    time: "all" as const,
    category: categoryId,
    sort: "popular" as const,
    saved: false,
    page: 1,
    pageSize: 12,
    view: "grid" as const,
  };
}

/** Horizontally scrollable GEOlibrary category tiles with arrow controls. */
export function LibraryCategoryRail({ className }: { className?: string }) {
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
  }, [updateScrollState]);

  const nudge = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    const tile = el.querySelector<HTMLElement>("[data-category-tile]");
    const step = tile ? tile.offsetWidth + 16 : Math.max(240, el.clientWidth * 0.75);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <AnimatedSection className={cn("overflow-x-clip", className ?? "mt-12")}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:gap-4">
        <h2 className="text-lg font-light uppercase tracking-[0.12em] text-foreground">
          Browse by category
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {([-1, 1] as const).map((dir) => {
            const disabled = dir === -1 ? !canScrollLeft : !canScrollRight;
            return (
              <button
                key={dir}
                type="button"
                disabled={disabled}
                onClick={() => nudge(dir)}
                aria-label={
                  dir === -1 ? "Scroll categories left" : "Scroll categories right"
                }
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

      <div ref={railRef} className="rail-scroll mt-6 flex gap-4 pb-1">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            data-category-tile
            to="/geolibrary/browse"
            search={categoryBrowseSearch(category.id)}
            className={cn(
              "glass-panel surface-gradient flex items-center gap-3 rounded-2xl p-4 text-sm text-foreground/75 transition-all motion-fast hover:border-bronze/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
              libraryCategoryTileClass,
            )}
          >
            <category.icon className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.6} />
            <span className="truncate">{category.label}</span>
          </Link>
        ))}
      </div>
    </AnimatedSection>
  );
}
