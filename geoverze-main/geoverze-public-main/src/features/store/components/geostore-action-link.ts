import { cn } from "@/lib/utils";

/** Shared fixed GEOstore icon-only action control (wishlist, cart, search). */
export function geostoreActionLinkClass(active: boolean) {
  return cn(
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border backdrop-blur transition-all motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
    active
      ? "border-bronze/55 bg-bronze/14 text-bronze-glow shadow-[var(--glow-bronze)]"
      : "border-bronze/30 bg-charcoal/80 text-foreground/80 hover:border-bronze/50 hover:bg-bronze/10 hover:text-bronze-glow hover:shadow-[0_8px_24px_-8px_oklch(0.55_0.08_55_/_0.35)]",
  );
}
