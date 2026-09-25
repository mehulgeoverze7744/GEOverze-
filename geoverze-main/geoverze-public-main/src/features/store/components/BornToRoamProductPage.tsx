import { memo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Coins, Globe, Heart, Leaf, Package, Ruler, Shield } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  GeoButton,
  Modal,
  PageHeader,
  SectionContainer,
} from "@/components/shared";
import type { GeostoreMerchProduct } from "@/features/marketing/data/geostoreMerch";
import { cn } from "@/lib/utils";

// ── Color variant images ────────────────────────────────────────────────────

import tshirtBlack from "@/assets/geostore/tshirt-born-to-roam-black.jpg";
import tshirtBlue from "@/assets/geostore/tshirt-born-to-roam-blue.png";
import tshirtBurgundy from "@/assets/geostore/tshirt-born-to-roam-burgundy.png";
import tshirtOliveGreen from "@/assets/geostore/tshirt-born-to-roam-olive-green.png";
import tshirtOffWhite from "@/assets/geostore/tshirt-born-to-roam-off-white.png";

// ── Types ───────────────────────────────────────────────────────────────────

type ColorVariant = {
  id: string;
  label: string;
  /** Inline CSS hex for the round swatch dot */
  hex: string;
  image: string;
};

type Size = "S" | "M" | "L" | "XXL";

// ── Data ────────────────────────────────────────────────────────────────────

const COLOR_VARIANTS: ColorVariant[] = [
  { id: "black", label: "Black", hex: "#111111", image: tshirtBlack },
  { id: "blue", label: "Blue", hex: "#2d4a6e", image: tshirtBlue },
  { id: "burgundy", label: "Burgundy", hex: "#6b1f2a", image: tshirtBurgundy },
  { id: "olive", label: "Olive Green", hex: "#4a5240", image: tshirtOliveGreen },
  { id: "offwhite", label: "Off White", hex: "#e8e4dc", image: tshirtOffWhite },
];

const SIZES: Size[] = ["S", "M", "L", "XXL"];

const SIZE_GUIDE: { size: Size; chest: string; length: string }[] = [
  { size: "S", chest: '36–38"', length: '27"' },
  { size: "M", chest: '38–40"', length: '28"' },
  { size: "L", chest: '40–42"', length: '29"' },
  { size: "XXL", chest: '44–46"', length: '31"' },
];

const TRUST_ITEMS = [
  { icon: Package, label: "220 gsm combed cotton" },
  { icon: Globe, label: "Ships worldwide" },
  { icon: Shield, label: "Quality guaranteed" },
  { icon: Leaf, label: "Sustainably sourced" },
] as const;

// ── Sub-components ───────────────────────────────────────────────────────────

function AccordionRow({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-bronze/12">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-light text-foreground/75 transition-colors hover:text-foreground"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-bronze/50 transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>
      {open ? (
        <div className="pb-5 text-sm leading-relaxed text-foreground/55">{children}</div>
      ) : null}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export const BornToRoamProductPage = memo(function BornToRoamProductPage({
  product,
}: {
  product: GeostoreMerchProduct;
}) {
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant>(COLOR_VARIANTS[0]);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const handleNotifyMe = () => {
    toast.message("Available soon", {
      description: "Merchandise checkout is coming. We'll announce it on the platform.",
    });
  };

  const handleWishlist = () => {
    const next = !wishlisted;
    setWishlisted(next);
    toast.message(next ? "Saved to wishlist" : "Removed from wishlist", {
      description: next ? "We'll let you know when Born to Roam ships." : undefined,
    });
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="T-SHIRT"
        title="Born to Roam T-Shirt"
        description="For explorers who treat every border as an invitation."
        breadcrumb={[
          { label: "GEOstore", to: "/geostore" },
          { label: "T-Shirts", to: "/geostore/category/tshirts" },
          { label: "Born to Roam T-Shirt" },
        ]}
      />

      <SectionContainer size="wide">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
          {/* ── Gallery column ─────────────────────────────────────── */}
          <AnimatedSection className="space-y-3">
            {/* Primary image */}
            <div className="overflow-hidden rounded-2xl border border-bronze/12 bg-[oklch(0.14_0.006_62)]">
              <img
                key={selectedVariant.id}
                src={selectedVariant.image}
                alt={`${product.alt} — ${selectedVariant.label.toLowerCase()} colourway`}
                className="aspect-square w-full object-cover transition-opacity duration-300"
              />
            </div>

            {/* Thumbnail strip — one thumbnail per colour variant */}
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {COLOR_VARIANTS.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  aria-label={`View ${variant.label} colourway`}
                  aria-pressed={selectedVariant.id === variant.id}
                  className={cn(
                    "h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-[oklch(0.14_0.006_62)] transition-all duration-200",
                    selectedVariant.id === variant.id
                      ? "border-bronze ring-1 ring-bronze/50"
                      : "border-bronze/12 opacity-55 hover:opacity-85",
                  )}
                >
                  <img
                    src={variant.image}
                    alt={variant.label}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* ── Info panel (sticky on desktop) ─────────────────────── */}
          <AnimatedSection delay={80} className="lg:sticky lg:top-6 lg:self-start">
            <div className="space-y-6">
              {/* Label */}
              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-bronze/70">
                T-Shirt · GEOverze Collection
              </p>

              {/* Name + tagline */}
              <div>
                <h2 className="text-2xl font-light tracking-tight text-foreground">
                  Born to Roam T-Shirt
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">
                  0%&nbsp;LOCAL. 100%&nbsp;GLOBAL. BORN&nbsp;TO&nbsp;ROAM. — heavyweight
                  220&nbsp;gsm combed cotton, cut in a relaxed explorer fit. Bronze-on-charcoal
                  screen&nbsp;print.
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-light text-foreground">$37.00</span>
                <span className="text-xs text-foreground/30">·</span>
                <span className="flex items-center gap-1.5 text-sm text-bronze/80">
                  <Coins className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                  300 credits
                </span>
              </div>

              {/* Available soon badge */}
              <p className="inline-flex items-center rounded-full border border-bronze/25 bg-bronze/8 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-bronze-glow">
                Available soon
              </p>

              {/* Colour picker */}
              <div className="space-y-2.5">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-foreground/45">
                  Colour&nbsp;
                  <span className="text-foreground/75">{selectedVariant.label}</span>
                </p>
                <div className="flex gap-2.5">
                  {COLOR_VARIANTS.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      title={variant.label}
                      aria-label={variant.label}
                      aria-pressed={selectedVariant.id === variant.id}
                      className={cn(
                        "h-7 w-7 rounded-full border-2 transition-all duration-150",
                        selectedVariant.id === variant.id
                          ? "border-bronze ring-2 ring-bronze/35 ring-offset-2 ring-offset-background"
                          : "border-white/10 hover:border-white/25",
                      )}
                      style={{ backgroundColor: variant.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size picker */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-foreground/45">
                    Size
                    {selectedSize ? (
                      <span className="ml-2 text-foreground/75">{selectedSize}</span>
                    ) : null}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.18em] text-bronze/65 transition-colors hover:text-bronze"
                  >
                    <Ruler className="h-3 w-3" strokeWidth={1.5} />
                    Size guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={cn(
                        "rounded-lg border py-2.5 text-sm font-light transition-all duration-150",
                        selectedSize === size
                          ? "border-bronze bg-bronze/10 text-foreground"
                          : "border-bronze/18 text-foreground/50 hover:border-bronze/45 hover:text-foreground/80",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-foreground/45">
                  Quantity
                </p>
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-bronze/18">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center text-foreground/55 transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-light text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center text-foreground/55 transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA row */}
              <div className="flex flex-wrap gap-3 pt-1">
                <GeoButton
                  variant="solid"
                  disabled
                  onClick={handleNotifyMe}
                  className="flex-1 basis-32"
                >
                  Available Soon
                </GeoButton>
                <GeoButton
                  variant="ghost"
                  onClick={handleWishlist}
                  aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  className="px-4"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      wishlisted ? "fill-rose-400 text-rose-400" : "text-current",
                    )}
                    strokeWidth={1.5}
                  />
                </GeoButton>
              </div>

              {/* Trust row */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-bronze/8 pt-5">
                {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-[0.72rem] text-foreground/45"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-bronze/55" strokeWidth={1.5} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <div className="border-t border-bronze/8 pt-1">
                <AccordionRow title="Product Details" defaultOpen>
                  <ul className="space-y-1.5">
                    <li>220 gsm 100% combed organic cotton</li>
                    <li>Relaxed explorer fit — unisex sizing</li>
                    <li>Plastisol screen-print, bronze-on-charcoal</li>
                    <li>Reinforced crew neck and double-stitched hem</li>
                    <li>Machine wash cold · tumble dry low</li>
                    <li>Ethically certified · sustainably produced</li>
                  </ul>
                </AccordionRow>

                <AccordionRow title="Size Guide">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-foreground/40">
                        <th className="pb-2 font-normal">Size</th>
                        <th className="pb-2 font-normal">Chest</th>
                        <th className="pb-2 font-normal">Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bronze/8">
                      {SIZE_GUIDE.map((row) => (
                        <tr key={row.size}>
                          <td className="py-1.5">{row.size}</td>
                          <td className="py-1.5">{row.chest}</td>
                          <td className="py-1.5">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AccordionRow>

                <AccordionRow title="Shipping &amp; Fulfilment">
                  <div className="space-y-2">
                    <p>Physical fulfilment is coming soon.</p>
                    <p>
                      When live: ships from UK/EU fulfilment centres to 120+&nbsp;countries.
                      Estimated delivery 4–12 business days. Tracking included with every order.
                    </p>
                  </div>
                </AccordionRow>
              </div>

              {/* Back link */}
              <div className="pt-1">
                <GeoButton asChild variant="ghost" size="sm">
                  <Link to="/geostore/category/$slug" params={{ slug: "tshirts" }}>
                    ← Back to T-Shirts
                  </Link>
                </GeoButton>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </SectionContainer>

      {/* Size guide modal */}
      <Modal
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
        title="Size Guide"
        description="All measurements are in inches. Measure your chest at its widest point."
      >
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/40">
              <th className="pb-3 font-normal">Size</th>
              <th className="pb-3 font-normal">Chest</th>
              <th className="pb-3 font-normal">Length</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bronze/12">
            {SIZE_GUIDE.map((row) => (
              <tr key={row.size} className="text-foreground/70">
                <td className="py-2">{row.size}</td>
                <td className="py-2">{row.chest}</td>
                <td className="py-2">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </PageShell>
  );
});
