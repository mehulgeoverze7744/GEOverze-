import { Coins } from "lucide-react";

import { cn } from "@/lib/utils";

import { credits as formatCredits, discountPercent, money } from "../lib/format";
import type { Product } from "../data/products";

/**
 * Money and credit pricing for a product. Both routes are shown when an item
 * accepts either, so the credit path is never hidden behind the cash path.
 */
export function PriceTag({
  product,
  size = "default",
  className,
}: {
  product: Pick<Product, "price" | "compareAt" | "credits">;
  size?: "default" | "lg";
  className?: string;
}) {
  const off = discountPercent(product.price, product.compareAt);

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      {product.price !== null ? (
        <>
          <span
            className={cn(
              "font-light tracking-tight text-foreground",
              size === "lg" ? "text-3xl" : "text-lg",
            )}
          >
            {money(product.price)}
          </span>
          {product.compareAt !== null ? (
            <span className="text-xs text-foreground/50 line-through">
              {money(product.compareAt)}
            </span>
          ) : null}
          {off !== null ? (
            <span className="rounded-full border border-bronze/45 bg-bronze/12 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-bronze-glow">
              {off}% off
            </span>
          ) : null}
        </>
      ) : null}

      {product.credits !== null ? (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-bronze-glow",
            product.price === null
              ? size === "lg"
                ? "text-2xl font-light"
                : "text-base font-light"
              : "text-xs",
          )}
        >
          <Coins className={product.price === null ? "h-5 w-5" : "h-3.5 w-3.5"} strokeWidth={1.6} />
          {product.price === null
            ? formatCredits(product.credits)
            : `or ${formatCredits(product.credits)}`}
        </span>
      ) : null}
    </div>
  );
}
