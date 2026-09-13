import { cn } from "@/lib/utils";

/** Shared fixed GEOstore action control styling (wishlist, cart). */
export function geostoreActionLinkClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-2 rounded-full border px-3 py-2 backdrop-blur transition-all motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
    active
      ? "border-bronze/55 bg-bronze/14 text-bronze-glow shadow-[var(--glow-bronze)]"
      : "border-bronze/30 bg-charcoal/80 text-foreground/80 hover:border-bronze/50 hover:bg-bronze/10 hover:text-bronze-glow hover:shadow-[0_8px_24px_-8px_oklch(0.55_0.08_55_/_0.35)]",
  );
}
