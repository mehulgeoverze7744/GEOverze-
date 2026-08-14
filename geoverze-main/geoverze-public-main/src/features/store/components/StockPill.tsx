import { cn } from "@/lib/utils";

import type { StockState } from "../data/products";

const COPY: Record<StockState, { label: string; tone: string }> = {
  "in-stock": { label: "In stock", tone: "border-bronze/25 text-foreground/55" },
  low: { label: "Low stock", tone: "border-bronze/55 bg-bronze/12 text-bronze-glow" },
  preorder: { label: "Pre-order", tone: "border-bronze/35 text-bronze" },
  "sold-out": { label: "Sold out", tone: "border-foreground/15 text-foreground/50" },
};

/** Availability chip shared by cards, product pages and the cart. */
export function StockPill({ stock, className }: { stock: StockState; className?: string }) {
  const copy = COPY[stock];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.16em]",
        copy.tone,
        className,
      )}
    >
      {copy.label}
    </span>
  );
}
