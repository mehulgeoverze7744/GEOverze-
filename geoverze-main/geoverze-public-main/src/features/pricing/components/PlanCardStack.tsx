import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type { BillingCycle, PricingPlan } from "../data/plans";
import { PlanCard } from "./PlanCard";

const PEEK = 64;
const OVERLAP = 8;
const SCALE_STEP = 0.04;
const SWIPE_THRESHOLD = 42;

function visualOrder(index: number, active: number, count: number) {
  return (index - active + count) % count;
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
  const [dragY, setDragY] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pointer = useRef<{ id: number; y: number; dragging: boolean } | null>(null);
  const labelId = useId();

  useEffect(() => {
    if (featuredIndex >= 0) setActive(featuredIndex);
  }, [featuredIndex]);

  const measure = useCallback(() => {
    const node = cardRefs.current[active] ?? cardRefs.current[0];
    if (!node) return;
    const next = Math.round(node.getBoundingClientRect().height);
    if (next > 0) setCardHeight(next);
  }, [active]);

  useLayoutEffect(() => {
    measure();
    const node = cardRefs.current[active];
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [active, measure, cycle, plans]);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
      setDragY(0);
    },
    [count],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointer.current = { id: event.pointerId, y: event.clientY, dragging: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = pointer.current;
    if (!session || session.id !== event.pointerId) return;
    const dy = event.clientY - session.y;
    if (!session.dragging && Math.abs(dy) > 10) {
      session.dragging = true;
      stackRef.current?.setPointerCapture(event.pointerId);
    }
    if (session.dragging) {
      event.preventDefault();
      setDragY(dy);
    }
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = pointer.current;
    if (!session || session.id !== event.pointerId) return;
    const dy = event.clientY - session.y;
    const wasDragging = session.dragging;
    pointer.current = null;
    setDragY(0);
    if (!wasDragging) return;
    event.preventDefault();
    if (dy <= -SWIPE_THRESHOLD) goTo(active + 1);
    else if (dy >= SWIPE_THRESHOLD) goTo(active - 1);
  };

  const stackHeight =
    cardHeight > 0 ? cardHeight + PEEK * Math.max(0, count - 1) - OVERLAP : undefined;

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
        if (pointer.current?.dragging) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <p id={labelId} className="sr-only">
        Membership plans. Swipe vertically or tap a card to bring it forward.
      </p>
      {plans.map((plan, index) => {
        const order = visualOrder(index, active, count);
        const isFront = order === 0;
        const baseY = isFront || cardHeight === 0 ? 0 : cardHeight - OVERLAP + (order - 1) * PEEK;
        const y = baseY + (isFront ? dragY * 0.16 : 0);
        const scale = 1 - Math.min(order, 3) * SCALE_STEP;

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
            )}
            style={{
              transform: `translate3d(-50%, ${y}px, 0) scale(${scale})`,
              zIndex: count - order,
              height: isFront || cardHeight === 0 ? undefined : PEEK + OVERLAP,
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
