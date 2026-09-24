import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
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

type SlotLayout = {
  x: number;
  scale: number;
  width: number;
  z: number;
  opacity: number;
  y: number;
};

type SlotConfig = { scale: number; width: number; y: number };

function scaledHalf(width: number, scale: number): number {
  return (width * scale) / 2;
}

/** Center distance between two adjacent cards for a consistent overlap fraction. */
function pairStep(left: SlotConfig, right: SlotConfig, overlapFraction: number): number {
  const leftHalf = scaledHalf(left.width, left.scale);
  const rightHalf = scaledHalf(right.width, right.scale);
  const avgScaled = (left.width * left.scale + right.width * right.scale) / 2;
  return leftHalf + rightHalf - overlapFraction * avgScaled;
}

function buildOverlapLayout(
  offsets: number[],
  configs: Record<number, SlotConfig>,
  overlapFraction: number,
  stageWidth: number,
  edgeInset: number,
): Map<number, SlotLayout> {
  const xs = new Map<number, number>();
  const layouts = new Map<number, SlotLayout>();
  xs.set(0, 0);

  for (const offset of offsets.filter((value) => value > 0).sort((a, b) => a - b)) {
    const prev = offset - 1;
    xs.set(offset, xs.get(prev)! + pairStep(configs[prev]!, configs[offset]!, overlapFraction));
  }

  for (const offset of offsets.filter((value) => value < 0).sort((a, b) => b - a)) {
    const next = offset + 1;
    xs.set(offset, xs.get(next)! - pairStep(configs[offset]!, configs[next]!, overlapFraction));
  }

  const maxExtent = Math.max(
    ...offsets.map((offset) => {
      const cfg = configs[offset]!;
      return Math.abs(xs.get(offset)!) + scaledHalf(cfg.width, cfg.scale);
    }),
  );
  const availableHalf = stageWidth / 2 - edgeInset;
  const fit = maxExtent > availableHalf ? availableHalf / maxExtent : 1;

  for (const offset of offsets) {
    const cfg = configs[offset]!;
    layouts.set(offset, {
      x: xs.get(offset)! * fit,
      scale: cfg.scale,
      width: cfg.width,
      z: 30 - Math.abs(offset) * 8,
      opacity: 1 - Math.abs(offset) * 0.05,
      y: cfg.y,
    });
  }

  return layouts;
}

function computeOverlapSlots(
  tier: "mobile" | "tablet" | "desktop",
  stageWidth: number,
): Map<number, SlotLayout> {
  const edgeInset = tier === "mobile" ? 10 : tier === "tablet" ? 16 : 20;
  const overlapFraction = tier === "mobile" ? 0.14 : tier === "tablet" ? 0.15 : 0.16;

  if (tier === "mobile") {
    const centerW = Math.min(280, Math.max(248, stageWidth * 0.76));
    const sideW = centerW * 0.84;
    const sideScale = 0.86;
    return buildOverlapLayout(
      [-1, 0, 1],
      {
        [-1]: { scale: sideScale, width: sideW, y: 8 },
        [0]: { scale: 1, width: centerW, y: 0 },
        [1]: { scale: sideScale, width: sideW, y: 8 },
      },
      overlapFraction,
      stageWidth,
      edgeInset,
    );
  }

  const centerW =
    tier === "tablet"
      ? Math.min(300, Math.max(260, stageWidth * 0.22))
      : Math.min(340, Math.max(300, stageWidth * 0.21));
  const sideW = centerW * 0.86;
  const outerW = centerW * 0.76;
  const sideScale = tier === "tablet" ? 0.9 : 0.92;
  const outerScale = tier === "tablet" ? 0.83 : 0.85;

  return buildOverlapLayout(
    [-2, -1, 0, 1, 2],
    {
      [-2]: { scale: outerScale, width: outerW, y: tier === "tablet" ? 10 : 12 },
      [-1]: { scale: sideScale, width: sideW, y: tier === "tablet" ? 5 : 6 },
      [0]: { scale: 1, width: centerW, y: 0 },
      [1]: { scale: sideScale, width: sideW, y: tier === "tablet" ? 5 : 6 },
      [2]: { scale: outerScale, width: outerW, y: tier === "tablet" ? 10 : 12 },
    },
    overlapFraction,
    stageWidth,
    edgeInset,
  );
}

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

/** Fixed card height per tier — stage matches center card at scale 1 (origin-top). */
function digitalCarouselCardHeight(
  tier: "mobile" | "tablet" | "desktop",
  stageWidth: number,
): number {
  if (tier === "mobile") {
    return Math.min(372, Math.max(320, Math.round(stageWidth * 0.9)));
  }
  if (tier === "tablet") {
    return 400;
  }
  return Math.min(468, Math.max(420, Math.round(stageWidth * 0.36)));
}

function useStageWidth(ref: RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(1280);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => setWidth(node.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return width;
}

function CarouselCard({
  category,
  active,
  layout,
  cardHeightPx,
  transitionMs,
  onFocus,
}: {
  category: StoreCategory;
  active: boolean;
  layout: SlotLayout;
  cardHeightPx: number;
  transitionMs: number;
  onFocus: () => void;
}) {
  const count = categoryItemCount(category.id);
  const banner = categoryBannerForId(category.id);
  const Icon = category.icon;

  const cardBody = (
    <>
      <div className="relative min-h-0 w-full flex-1 overflow-hidden">
        <CoverArt
          art={`cat-${category.id}`}
          icon={Icon}
          ratio="fill"
          fit="cover"
          overlay="subtle"
          className="absolute inset-0 h-full w-full"
          {...(banner ? { imageSrc: banner.src, imageAlt: banner.alt } : {})}
        />
      </div>
      <div className="flex shrink-0 items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-light tracking-tight text-foreground">{category.label}</h3>
          <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-foreground/50">
            {category.blurb}
          </p>
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
    "group/card absolute left-1/2 top-0 flex h-full min-h-0 origin-top flex-col overflow-hidden rounded-2xl border bg-charcoal/50 shadow-[0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur-sm will-change-transform",
    active
      ? "border-bronze/35 bronze-glow hover:border-bronze/45"
      : "border-bronze/12 hover:border-bronze/28 hover:bronze-glow",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
  );

  const style = {
    width: layout.width,
    height: cardHeightPx,
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
  const stageRef = useRef<HTMLDivElement>(null);
  const stageWidth = useStageWidth(stageRef);
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

  const cardHeightPx = digitalCarouselCardHeight(tier, stageWidth);
  const stageHeight = `${cardHeightPx}px`;
  const slotLayouts = computeOverlapSlots(tier, stageWidth);

  return (
    <AnimatedSection className="mt-[var(--space-section-sm)] overflow-x-clip">
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
        className="relative -mx-6 mt-8 w-[calc(100%+3rem)] max-w-none outline-none md:-mx-10 md:w-[calc(100%+5rem)]"
      >
        {/* Subtle atmospheric depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] h-64 w-[min(100%,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--bronze) 16%, transparent) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[8%] top-1/2 hidden h-px -translate-y-16 bg-gradient-to-r from-transparent via-bronze/15 to-transparent lg:block"
        />

        <div
          ref={stageRef}
          className="relative w-full overflow-hidden"
          style={{ height: stageHeight }}
        >
          {DIGITAL_CATEGORIES.map((category, index) => {
            const offset = circularOffset(index, activeIndex, total);
            const layout = slotLayouts.get(offset) ?? null;
            if (!layout) return null;

            return (
              <CarouselCard
                key={category.id}
                category={category}
                active={offset === 0}
                layout={layout}
                cardHeightPx={cardHeightPx}
                transitionMs={transitionMs}
                onFocus={() => goTo(index)}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-center pt-3 sm:pt-4">
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
