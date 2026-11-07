import { cn } from "@/lib/utils";

/** Compact OWNED pill used on reward and product cards. */
export const ownedBadgeClassName =
  "rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-[#111827] shadow-[0_8px_16px_-8px_rgb(17_24_39_/_0.45)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#D1D5DB] hover:bg-[#F5F6F8] hover:shadow-[0_10px_18px_-8px_rgb(17_24_39_/_0.4)]";

export function OwnedBadge({ className }: { className?: string }) {
  return (
    <span className={cn(ownedBadgeClassName, className)}>
      Owned
    </span>
  );
}
