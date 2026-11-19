import { cn } from "@/lib/utils";

import { GvrzeProDiscountBadge } from "./GvrzeProDiscountBadge";

type StorefrontProductPriceRowProps = {
  priceLabel: string;
  className?: string;
  priceClassName?: string;
  /** Hide the Pro perk badge (e.g. coming-soon placeholders without pricing). */
  showProBadge?: boolean;
};

/** PDP price line — primary price typography with compact Pro discount badge. */
export function StorefrontProductPriceRow({
  priceLabel,
  className,
  priceClassName,
  showProBadge = true,
}: StorefrontProductPriceRowProps) {
  return (
    <div
      className={cn(
        "mt-3 flex min-w-0 max-w-full flex-wrap items-baseline gap-x-2.5 gap-y-1.5",
        className,
      )}
    >
      <p
        className={cn(
          "min-w-0 text-[20px] font-bold leading-tight text-black sm:text-[22px]",
          priceClassName,
        )}
      >
        {priceLabel}
      </p>
      {showProBadge ? <GvrzeProDiscountBadge /> : null}
    </div>
  );
}