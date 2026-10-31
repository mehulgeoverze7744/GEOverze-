import { cn } from "@/lib/utils";

import type { StockState } from "../data/products";

const COPY: Record<StockState, { label: string; tone: string; lightTone: string }> = {
  "in-stock": {
    label: "In stock",
    tone: "border-bronze/25 text-foreground/55",
    lightTone: "border-[#E5E7EB] bg-[#FFFFFF] text-[#555555]",
  },
  low: {
    label: "Low stock",
    tone: "border-bronze/55 bg-bronze/12 text-bronze-glow",
    lightTone: "border-[#E5E7EB] bg-[#FFFFFF] text-[#555555]",
  },
  preorder: {
    label: "Pre-order",
    tone: "border-bronze/35 text-bronze",
    lightTone: "border-[#E5E7EB] bg-[#FFFFFF] text-[#555555]",
  },
  "sold-out": {
    label: "Sold out",
    tone: "border-foreground/15 text-foreground/50",
    lightTone: "border-[#E5E7EB] bg-[#FFFFFF] text-[#555555]",
  },
};

/** Availability chip shared by cards, product pages and the cart. */
export function StockPill({
  stock,
  className,
  tone = "default",
}: {
  stock: StockState;
  className?: string;
  tone?: "default" | "light";
}) {
  const copy = COPY[stock];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.16em]",
        tone === "light" ? copy.lightTone : copy.tone,
        className,
      )}
    >
      {copy.label}
    </span>
  );
}
