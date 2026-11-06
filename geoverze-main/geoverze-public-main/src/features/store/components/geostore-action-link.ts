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
 * Cream-warm circular button — used for Cart only.
 *
 * The distinctive light background makes the cart immediately identifiable at a
 * glance, matching the cream treatment in StorefrontNav's CART_ICON_BUTTON.
 * The border is intentionally very subtle (black/15–20) so only the cream fill
 * reads as the visual differentiator — no visible golden ring.
 * Icon inherits `currentColor`; use a dark text colour so it reads on cream.
 */
export function geostoreCartLinkClass(active: boolean) {
  return cn(
    BASE,
    active
      ? // On the cart/checkout page: slightly warmer cream fill to signal current location
        "border-black/20 bg-[oklch(0.94_0.04_75)] text-charcoal shadow-[0_4px_16px_-4px_oklch(0_0_0/0.12)]"
      : // Default: warm cream background, nearly invisible border
        "border-black/15 bg-[oklch(0.96_0.04_75)]/90 text-charcoal/85 hover:border-black/25 hover:bg-[oklch(0.95_0.05_72)]/95 hover:text-charcoal",
  );
}
