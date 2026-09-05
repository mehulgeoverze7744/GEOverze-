import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Layers } from "lucide-react";

import { AnimatedSection } from "@/components/shared";
import {
  isMerchStoreCategory,
  merchCountForStoreCategory,
  type MerchStoreCategorySlug,
} from "@/features/marketing/data/geostoreMerch";
import { CoverArt } from "@/features/play/components/CoverArt";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

import { categoryBannerForId } from "../data/categoryBanners";
import { productsInCategory } from "../data/products";
import { categoriesInGroup, type StoreCategory } from "../data/taxonomy";

const DIGITAL_CATEGORIES = categoriesInGroup("digital");
const INITIAL_ACTIVE = DIGITAL_CATEGORIES.findIndex((c) => c.id === "theme-packs");
const GESTURE_COOLDOWN_MS = 650;
const HORIZONTAL_DELTA_THRESHOLD = 28;
const SWIPE_THRESHOLD = 48;

type SlotOffset = -2 | -1 | 0 | 1 | 2;

type SlotLayout = {
  x: number;
  scale: number;
  width: number;
  z: number;
  opacity: number;
  y: number;
};

const DESKTOP_SLOTS: Record<SlotOffset, SlotLayout> = {
  [-2]: { x: -310, scale: 0.74, width: 320, z: 10, opacity: 0.78, y: 14 },
  [-1]: { x: -168, scale: 0.88, width: 400, z: 20, opacity: 0.92, y: 8 },
  [0]: { x: 0, scale: 1, width: 500, z: 30, opacity: 1, y: 0 },
  [1]: { x: 168, scale: 0.88, width: 400, z: 20, opacity: 0.92, y: 8 },
  [2]: { x: 310, scale: 0.74, width: 320, z: 10, opacity: 0.78, y: 14 },
};

const TABLET_SLOTS: Record<SlotOffset, SlotLayout> = {
  [-2]: { x: -240, scale: 0.76, width: 260, z: 10, opacity: 0.8, y: 12 },
  [-1]: { x: -130, scale: 0.9, width: 320, z: 20, opacity: 0.92, y: 6 },
  [0]: { x: 0, scale: 1, width: 400, z: 30, opacity: 1, y: 0 },
  [1]: { x: 130, scale: 0.9, width: 320, z: 20, opacity: 0.92, y: 6 },
  [2]: { x: 240, scale: 0.76, width: 260, z: 10, opacity: 0.8, y: 12 },
};

const MOBILE_SLOTS: Record<-1 | 0 | 1, SlotLayout> = {
  [-1]: { x: -88, scale: 0.84, width: 240, z: 20, opacity: 0.82, y: 10 },
  [0]: { x: 0, scale: 1, width: 300, z: 30, opacity: 1, y: 0 },
  [1]: { x: 88, scale: 0.84, width: 240, z: 20, opacity: 0.82, y: 10 },
};

function categoryItemCount(categoryId: string): number {
  if (isMerchStoreCategory(categoryId)) {
    return merchCountForStoreCategory(categoryId as MerchStoreCategorySlug);
  }
  return productsInCategory(categoryId).length;
}

function circularOffset(index: number, active: number, total: number): number {
  let diff = index - active;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

function useViewportTier() {
  const [tier, setTier] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 639px)");
    const tablet = window.matchMedia("(min-width: 640px) and (max-width: 1023px)");

    const update = () => {
      if (mobile.matches) setTier("mobile");
      else if (tablet.matches) setTier("tablet");
      else setTier("desktop");
    };

    update();
    mobile.addEventListener("change", update);
    tablet.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mobile.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return tier;
}

function slotLayout(offset: number, tier: "mobile" | "tablet" | "desktop"): SlotLayout | null {
  if (tier === "mobile") {
    if (offset < -1 || offset > 1) return null;
    return MOBILE_SLOTS[offset as -1 | 0 | 1];
  }
  const slots = tier === "tablet" ? TABLET_SLOTS : DESKTOP_SLOTS;
  if (offset < -2 || offset > 2) return null;
  return slots[offset as SlotOffset];
}

function CarouselCard({
  category,
  active,
  layout,
  transitionMs,
  onFocus,
}: {
  category: StoreCategory;
  active: boolean;
  layout: SlotLayout;
  transitionMs: number;
  onFocus: () => void;
}) {
  const count = categoryItemCount(category.id);
  const banner = categoryBannerForId(category.id);
  const Icon = category.icon;

  const cardBody = (
    <>
      <CoverArt
        art={`cat-${category.id}`}
        icon={Icon}
        ratio="banner"
        fit="cover"
        overlay="subtle"
        {...(banner ? { imageSrc: banner.src, imageAlt: banner.alt } : {})}
      />
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <h3 className="text-sm font-light tracking-tight text-foreground">{category.label}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs text-foreground/50">{category.blurb}</p>
          <p className="mt-3 text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>
        <ArrowUpRight
          className={cn(
            "h-4 w-4 shrink-0 text-bronze/90 transition-transform motion-fast",
            active && "group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5",
          )}
        />
      </div>
    </>
  );

  const shellClass = cn(
    "group/card absolute left-1/2 top-0 origin-top overflow-hidden rounded-2xl border bg-charcoal/50 shadow-[0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur-sm will-change-transform",
    active
      ? "border-bronze/35 bronze-glow hover:border-bronze/45"
      : "border-bronze/12 hover:border-bronze/28 hover:bronze-glow",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
  );

  const style = {
    width: layout.width,
    zIndex: layout.z,
    opacity: layout.opacity,
    transform: `translateX(calc(-50% + ${layout.x}px)) translateY(${layout.y}px) scale(${layout.scale})`,
    transition: `transform ${transitionMs}ms var(--ease-cinematic), opacity ${transitionMs}ms var(--ease-cinematic), width ${transitionMs}ms var(--ease-cinematic), box-shadow ${transitionMs}ms var(--ease-cinematic)`,
  };

  if (active) {
    return (
      <Link
        to="/geostore/category/$slug"
        params={{ slug: category.id }}
        className={shellClass}
        style={style}
        aria-label={`${category.label} — view category`}
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={shellClass}
      style={style}
      onClick={onFocus}
      aria-label={`Focus ${category.label}`}
    >
      {cardBody}
    </button>
  );
}

/** Overlapping carousel for GEOstore digital product categories. */
export function DigitalProductsCarousel() {
  const reducedMotion = useReducedMotion();
  const transitionMs = reducedMotion ? 0 : 550;
  const tier = useViewportTier();
  const regionRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(INITIAL_ACTIVE >= 0 ? INITIAL_ACTIVE : 0);
  const gestureLockedUntilRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(INITIAL_ACTIVE >= 0 ? INITIAL_ACTIVE : 0);

  const total = DIGITAL_CATEGORIES.length;

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % total) + total) % total;
      activeIndexRef.current = next;
      setActiveIndex(next);
    },
    [total],
  );

  const goPrev = useCallback(() => goTo(activeIndexRef.current - 1), [goTo]);
  const goNext = useCallback(() => goTo(activeIndexRef.current + 1), [goTo]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const node = regionRef.current;
    if (!node) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (!node.contains(event.target as Node)) return;

      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);

      // Horizontal input only — vertical deltaY continues normal page scroll.
      if (absX < HORIZONTAL_DELTA_THRESHOLD || absX <= absY) return;

      const now = Date.now();
      if (now < gestureLockedUntilRef.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      gestureLockedUntilRef.current = now + GESTURE_COOLDOWN_MS;

      if (event.deltaX > 0) goNext();
      else goPrev();
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchMove = (event: TouchEvent) => {
      const start = touchStartRef.current;
      const touch = event.touches[0];
      if (!start || !touch) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;

      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;

      event.preventDefault();
      touchStartRef.current = null;
      gestureLockedUntilRef.current = Date.now() + GESTURE_COOLDOWN_MS;

      if (dx < 0) goNext();
      else goPrev();
    };

    const onTouchEnd = () => {
      touchStartRef.current = null;
    };

    node.addEventListener("keydown", onKeyDown);
    node.addEventListener("wheel", onWheel, { passive: false });
    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchmove", onTouchMove, { passive: false });
    node.addEventListener("touchend", onTouchEnd);
    node.addEventListener("touchcancel", onTouchEnd);

    return () => {
      node.removeEventListener("keydown", onKeyDown);
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      node.removeEventListener("touchend", onTouchEnd);
      node.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [goNext, goPrev]);

  // Sized to the visual card footprint — avoids empty space above the indicators.
  const stageHeight =
    tier === "mobile" ? "min(280px, 56vw)" : tier === "tablet" ? "300px" : "330px";

  return (
    <AnimatedSection className="mt-[var(--space-section-sm)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Layers className="h-4 w-4 text-bronze" strokeWidth={1.6} />
            <h2 className="text-lg font-light tracking-tight text-foreground">Digital products</h2>
          </div>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-foreground/50">
            Question packs, atlases and study material that unlock instantly.
          </p>
        </div>
        <Link
          to="/geostore/browse"
          className="inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-bronze transition-colors motion-fast hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        ref={regionRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Digital product categories"
        tabIndex={0}
        className="relative mt-8 outline-none"
      >
        {/* Subtle atmospheric depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] h-64 w-[min(100%,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--bronze) 16%, transparent) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-1/2 hidden h-px -translate-y-16 bg-gradient-to-r from-transparent via-bronze/15 to-transparent lg:block"
        />

        <div
          className="relative mx-auto w-full max-w-6xl overflow-hidden"
          style={{ height: stageHeight }}
        >
          {DIGITAL_CATEGORIES.map((category, index) => {
            const offset = circularOffset(index, activeIndex, total);
            const layout = slotLayout(offset, tier);
            if (!layout) return null;

            return (
              <CarouselCard
                key={category.id}
                category={category}
                active={offset === 0}
                layout={layout}
                transitionMs={transitionMs}
                onFocus={() => goTo(index)}
              />
            );
          })}
        </div>

        <div className="mt-1 flex items-center justify-center pt-1">
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Digital product slides"
          >
            {DIGITAL_CATEGORIES.map((category, index) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Show ${category.label}`}
                onClick={() => goTo(index)}
                className={cn(
                  "rounded-full transition-all motion-base",
                  index === activeIndex
                    ? "h-2 w-2 bg-bronze shadow-[0_0_10px_color-mix(in_oklab,var(--bronze-glow)_50%,transparent)]"
                    : "h-1.5 w-1.5 bg-foreground/25 hover:bg-bronze/45",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
