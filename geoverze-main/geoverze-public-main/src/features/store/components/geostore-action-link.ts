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
 * Cream-warm circular button with a subtle golden border — used for Cart only.
 *
 * The distinctive light background makes the cart immediately identifiable at a
 * glance; this mirrors the cream/golden treatment shown in the design reference.
 * Icon inherits `currentColor`; use a dark text colour so it reads on cream.
 */
export function geostoreCartLinkClass(active: boolean) {
  return cn(
    BASE,
    "border-2",
    active
      ? // On the cart/checkout page: amber-warm fill to signal current location
        "border-bronze bg-bronze/25 text-charcoal shadow-[0_0_18px_-3px_oklch(0.68_0.09_62/0.45)]"
      : // Default: warm cream background with subtle golden border
        "border-bronze/55 bg-[oklch(0.96_0.04_75)]/90 text-charcoal/85 hover:border-bronze/75 hover:bg-[oklch(0.95_0.05_72)]/95 hover:text-charcoal",
  );
}
