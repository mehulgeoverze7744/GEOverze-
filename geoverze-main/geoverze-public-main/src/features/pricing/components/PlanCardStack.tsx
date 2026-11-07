import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type { BillingCycle, PricingPlan } from "../data/plans";
import { PlanCard } from "./PlanCard";

const PEEK = 44;
const SCALE_STEP = 0.04;
const SWIPE_THRESHOLD = 40;
const AXIS_LOCK = 10;

function signedOffset(index: number, active: number, count: number) {
  let delta = index - active;
  const half = count / 2;
  if (delta > half) delta -= count;
  if (delta < -half) delta += count;
  return delta;
}

/** Mobile-only overlapping plan deck. Hidden from sm and up via CSS. */
export function PlanCardStack({
  cycle,
  plans,
}: {
  cycle: BillingCycle;
  plans: PricingPlan[];
}) {
  const count = plans.length;
  const featuredIndex = plans.findIndex((plan) => plan.featured);
  const [active, setActive] = useState(featuredIndex >= 0 ? featuredIndex : 0);
  const [cardHeight, setCardHeight] = useState(0);
  const [dragX, setDragX] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pointer = useRef<{
    id: number;
    x: number;
    y: number;
    dragging: boolean;
    axis: "pending" | "x" | "y";
  } | null>(null);
  const skipClick = useRef(false);
  const labelId = useId();

  useEffect(() => {
    if (featuredIndex >= 0) setActive(featuredIndex);
  }, [featuredIndex]);

  const measure = useCallback(() => {
    const next = Math.round(
      Math.max(
        0,
        ...cardRefs.current.map((node) => {
          const card = node?.querySelector<HTMLElement>(".pricing-plan-card");
          if (!card) return 0;
          const previousHeight = card.style.height;
          card.style.height = "auto";
          const natural = Math.max(card.scrollHeight, card.getBoundingClientRect().height);
          card.style.height = previousHeight;
          return natural;
        }),
      ),
    );
    if (next > 0) setCardHeight(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    for (const node of cardRefs.current) {
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [measure, cycle, plans]);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
      setDragX(0);
    },
    [count],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragging: false,
      axis: "pending",
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = pointer.current;
    if (!session || session.id !== event.pointerId) return;
    if (session.axis === "y") return;

    const dx = event.clientX - session.x;
    const dy = event.clientY - session.y;

    if (session.axis === "pending") {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        session.axis = "y";
        return;
      }
      session.axis = "x";
      session.dragging = true;
      stackRef.current?.setPointerCapture(event.pointerId);
    }

    if (session.dragging) {
      event.preventDefault();
      setDragX(dx);
    }
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = pointer.current;
    if (!session || session.id !== event.pointerId) return;
    const dx = event.clientX - session.x;
    const wasDragging = session.dragging;
    pointer.current = null;
    setDragX(0);
    if (!wasDragging) return;
    skipClick.current = true;
    event.preventDefault();
    if (dx <= -SWIPE_THRESHOLD) goTo(active + 1);
    else if (dx >= SWIPE_THRESHOLD) goTo(active - 1);
  };

  const stackHeight = cardHeight > 0 ? cardHeight + 20 : undefined;

  return (
    <div
      ref={stackRef}
      className="pricing-card-stack"
      role="list"
      aria-labelledby={labelId}
      style={stackHeight ? { height: stackHeight } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onClickCapture={(event) => {
        if (pointer.current?.dragging || skipClick.current) {
          event.preventDefault();
          event.stopPropagation();
          skipClick.current = false;
        }
      }}
    >
      <p id={labelId} className="sr-only">
        Membership plans. Swipe left or right, or tap a card to bring it forward.
      </p>
      {plans.map((plan, index) => {
        const offset = signedOffset(index, active, count);
        const isFront = offset === 0;
        const x = offset * PEEK + dragX * 0.72;
        const scale = 1 - Math.min(Math.abs(offset), 3) * SCALE_STEP;

        return (
          <div
            key={plan.id}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            role="listitem"
            className={cn(
              "pricing-card-stack__item",
              isFront && "pricing-card-stack__item--front",
              dragX !== 0 && "pricing-card-stack__item--dragging",
            )}
            style={{
              transform: `translate3d(-50%, 0, 0) translate3d(${x}px, 0, 0) scale(${scale})`,
              zIndex: count - Math.abs(offset),
              height: cardHeight > 0 ? cardHeight : undefined,
            }}
            aria-current={isFront ? "true" : undefined}
            aria-hidden={isFront ? undefined : true}
            onClick={() => {
              if (pointer.current?.dragging) return;
              if (!isFront) goTo(index);
            }}
          >
            <PlanCard plan={plan} cycle={cycle} />
          </div>
        );
      })}
    </div>
  );
}
