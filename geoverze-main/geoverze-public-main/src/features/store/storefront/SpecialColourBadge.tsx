import { cn } from "@/lib/utils";

/** Compact premium badge for exclusive colourways — sits on the product image. */
export function SpecialColourBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute right-2 top-2 z-10 select-none rounded-full border border-black/10 bg-white/92 px-2 py-[5px] text-[8px] font-semibold uppercase tracking-[0.14em] text-[#111111] shadow-[0_8px_18px_-12px_rgba(17,17,17,0.55)] backdrop-blur-[8px] sm:right-2.5 sm:top-2.5 sm:px-2.5 sm:text-[9px] sm:tracking-[0.16em]",
        className,
      )}
    >
      Special Colour
    </span>
  );
}
