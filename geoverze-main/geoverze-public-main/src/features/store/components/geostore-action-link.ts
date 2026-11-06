import { cn } from "@/lib/utils";

/** Shared base for all Gstore floating action buttons. */
const BASE =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition-all motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50";

/**
 * Dark-charcoal circular button — used for Wishlist and Search.
 * Icon inherits `currentColor`; keep the icon element's colour via text-* classes.
 */
export function geostoreActionLinkClass(active: boolean) {
  return cn(
    BASE,
    active
      ? "border-bronze/55 bg-bronze/14 text-bronze-glow shadow-[var(--glow-bronze)]"
      : "border-bronze/30 bg-charcoal/80 text-foreground/80 hover:border-bronze/50 hover:bg-bronze/10 hover:text-bronze-glow hover:shadow-[0_8px_24px_-8px_oklch(0.55_0.08_55_/_0.35)]",
  );
}

/**
 * Cart button — same dark-charcoal style as Wishlist and Search.
 * The cream background has been removed so the cart sits flush on the navbar.
 */
export function geostoreCartLinkClass(active: boolean) {
  return geostoreActionLinkClass(active);
}
