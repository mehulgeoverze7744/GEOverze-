import { cn } from "@/lib/utils";

import { SF_UI_FONT } from "./storefront-ui";

export const GVRZE_PRO_DISCOUNT_BADGE_LABEL = "✦ 10% off · Pro plan";

/** Informational Pro benefit — checkout logic unchanged; not a live discount control. */
export function GvrzeProDiscountBadge({ className }: { className?: string }) {
  return (
    <span
      role="note"
      className={cn(
        "inline-flex max-w-full shrink-0 items-center rounded-full bg-black px-2.5 py-[5px] text-[10px] font-semibold leading-none tracking-[0.01em] text-white sm:px-3 sm:py-1.5 sm:text-[11px]",
        SF_UI_FONT,
        className,
      )}
      title="GVRZE Pro members receive 10% off Gstore purchases at checkout"
    >
      {GVRZE_PRO_DISCOUNT_BADGE_LABEL}
    </span>
  );
}