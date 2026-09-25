import { memo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileText,
  Heart,
  LayoutGrid,
  Maximize2,
  Shirt,
  ShoppingBag,
  Shield,
  Sparkles,
  Truck,
  Ruler,
  Leaf,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton, Modal, SectionContainer } from "@/components/shared";
import {
  initialMerchColorIndex,
  type GeostoreMerchProduct,
} from "@/features/marketing/data/geostoreMerch";
import { cn } from "@/lib/utils";

import { useStoreActions } from "../lib/useStoreActions";

import tshirtBlack from "@/assets/geostore/tshirt-born-to-roam-black.jpg";
import tshirtBlue from "@/assets/geostore/tshirt-born-to-roam-blue.png";
import tshirtBurgundy from "@/assets/geostore/tshirt-born-to-roam-burgundy.png";
import tshirtOliveGreen from "@/assets/geostore/tshirt-born-to-roam-olive-green.png";
import tshirtOffWhite from "@/assets/geostore/tshirt-born-to-roam-off-white.png";

type ColorVariant = {
  id: string;
  label: string;
  hex: string;
  image: string;
};

type Size = "S" | "M" | "L" | "XXL";

const COLOR_VARIANTS: ColorVariant[] = [
  { id: "black", label: "Black", hex: "#111111", image: tshirtBlack },
  { id: "blue", label: "Blue", hex: "#2d4a6e", image: tshirtBlue },
  { id: "burgundy", label: "Burgundy", hex: "#6b1f2a", image: tshirtBurgundy },
  { id: "olive", label: "Olive Green", hex: "#4a5240", image: tshirtOliveGreen },
  { id: "offwhite", label: "Off White", hex: "#e8e4dc", image: tshirtOffWhite },
];

const SIZES: Size[] = ["S", "M", "L", "XXL"];

const TRUST_ITEMS = [
  { icon: Shield, label: "Secure checkout" },
  { icon: Sparkles, label: "Quality focused" },
  { icon: Compass, label: "Easy browsing" },
  { icon: Leaf, label: "Thoughtful production" },
] as const;

function AccordionRow({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof FileText;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-bronze/12">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 text-left text-[0.78rem] font-light tracking-wide text-foreground/65 transition-colors hover:text-foreground"
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-3.5 w-3.5 shrink-0 text-bronze/50" strokeWidth={1.5} />
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-bronze/45 transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>
      {open ? (
        <div className="pb-3.5 pl-6 text-sm leading-relaxed text-foreground/50">{children}</div>
      ) : null}
    </div>
  );
}

export const BornToRoamProductPage = memo(function BornToRoamProductPage({
  product,
}: {
  product: GeostoreMerchProduct;
}) {
  const [variantIndex, setVariantIndex] = useState(() =>
    initialMerchColorIndex(COLOR_VARIANTS, product.defaultColor),
  );
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { wishlistToggle, wishlist } = useStoreActions();

  const selectedVariant = COLOR_VARIANTS[variantIndex];
  const wishlisted = wishlist.includes(product.id);

  const selectVariant = (variant: ColorVariant) => {
    const next = COLOR_VARIANTS.findIndex((v) => v.id === variant.id);
    if (next >= 0) setVariantIndex(next);
  };

  const stepVariant = (dir: -1 | 1) => {
    setVariantIndex((i) => (i + dir + COLOR_VARIANTS.length) % COLOR_VARIANTS.length);
  };

  const handleAddToCart = () => {
    toast.message("Available soon", {
      description: "Merchandise checkout is not live yet.",
    });
  };

  const handleWishlist = () => {
    wishlistToggle(product.id);
  };

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+1.25rem)] pb-[var(--space-section-sm)]"
      >
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5 text-[0.68rem] text-foreground/45"
        >
          <Link
            to="/geostore"
            activeOptions={{ exact: true }}
            className="transition-colors hover:text-bronze"
          >
            Back to GEOstore
          </Link>
          <span className="text-foreground/25" aria-hidden>
            &gt;
          </span>
          <Link
            to="/geostore/category/$slug"
            params={{ slug: "tshirts" }}
            className="transition-colors hover:text-bronze"
          >
            T-Shirts
          </Link>
          <span className="text-foreground/25" aria-hidden>
            &gt;
          </span>
          <span className="text-foreground/70">Born to Roam T-Shirt</span>
        </nav>

        <div className="grid min-w-0 items-start gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-8 lg:gap-10">
          <div className="min-w-0 space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-bronze/15 bg-[oklch(0.12_0.006_62)]">
              <div className="aspect-[16/8] w-full">
                <img
                  key={selectedVariant.id}
                  src={selectedVariant.image}
                  alt={`${product.alt} — ${selectedVariant.label.toLowerCase()} colourway`}
                  className="h-full w-full object-contain object-center"
                />
              </div>

              <button
                type="button"
                onClick={() => stepVariant(-1)}
                aria-label="Previous colour"
                className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-bronze/20 bg-background/40 text-foreground/70 backdrop-blur-sm transition-colors hover:border-bronze/45 hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={() => stepVariant(1)}
                aria-label="Next colour"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-bronze/20 bg-background/40 text-foreground/70 backdrop-blur-sm transition-colors hover:border-bronze/45 hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                aria-label="View gallery fullscreen"
                className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-bronze/20 bg-background/40 text-foreground/70 backdrop-blur-sm transition-colors hover:border-bronze/45 hover:text-foreground"
              >
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {COLOR_VARIANTS.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectVariant(variant)}
                  aria-label={`View ${variant.label} colourway`}
                  aria-pressed={selectedVariant.id === variant.id}
                  className={cn(
                    "h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-[oklch(0.12_0.006_62)] transition-all duration-200 sm:h-16 sm:w-16",
                    selectedVariant.id === variant.id
                      ? "border-bronze ring-1 ring-bronze/50"
                      : "border-bronze/12 opacity-55 hover:opacity-90",
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

            <div>
              <AccordionRow title="Description" icon={FileText}>
                <p>{product.tagline} Front and back print: 0% LOCAL. 100% GLOBAL. BORN TO ROAM.</p>
              </AccordionRow>
              <AccordionRow title="Details" icon={LayoutGrid}>
                <ul className="space-y-1">
                  <li>GEOverze merch collection T-shirt</li>
                  <li>Five colourways: Black, Blue, Burgundy, Olive Green, Off White</li>
                  <li>Sizes S, M, L, XXL</li>
                  <li>Price $37.00 or 300 credits when checkout opens</li>
                </ul>
              </AccordionRow>
              <AccordionRow title="Care" icon={Shirt}>
                <p>
                  Care notes will ship with the garment. Treat printed tees as you would other
                  screen-printed cotton: wash inside-out, cool, and avoid high heat until we publish
                  the full care card.
                </p>
              </AccordionRow>
              <AccordionRow title="Shipping" icon={Truck}>
                <p>
                  Physical fulfilment is not live yet. Shipping options and delivery windows will be
                  listed here when this tee becomes available to order.
                </p>
              </AccordionRow>
            </div>
          </div>

          <div className="min-w-0 space-y-5 md:sticky md:top-[calc(var(--nav-height)+1.25rem)]">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-bronze/70">
              T-SHIRT · GEOVERZE COLLECTION
            </p>

            <div>
              <h1 className="text-[1.85rem] font-light leading-tight tracking-tight text-foreground sm:text-[2.1rem]">
                Born to Roam T-Shirt
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/50">
                Everyday tee with the GEOverze globe on the front and Born to Roam map print on the
                back.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-xl font-light text-foreground">$37.00</span>
              <span className="flex items-center gap-1.5 text-sm text-bronze/80">
                <Coins className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                300 credits
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-foreground/40">
                Colour <span className="text-foreground/75">{selectedVariant.label}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_VARIANTS.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => selectVariant(variant)}
                    title={variant.label}
                    aria-label={variant.label}
                    aria-pressed={selectedVariant.id === variant.id}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-all duration-150",
                      selectedVariant.id === variant.id
                        ? "border-bronze ring-2 ring-bronze/30 ring-offset-2 ring-offset-background"
                        : "border-white/10 hover:border-white/25",
                    )}
                    style={{ backgroundColor: variant.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-foreground/40">
                  Size
                  {selectedSize ? (
                    <span className="ml-2 text-foreground/75">{selectedSize}</span>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.16em] text-bronze/65 transition-colors hover:text-bronze"
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
                      "rounded-lg border py-2 text-sm font-light transition-all duration-150",
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

            <div className="space-y-2">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-foreground/40">
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

            <div className="flex items-center gap-2.5">
              <GeoButton
                variant="solid"
                size="lg"
                onClick={handleAddToCart}
                className="min-w-0 flex-1 rounded-full"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />
                Add to cart
              </GeoButton>
              <GeoButton
                variant="ghost"
                onClick={handleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                className="h-12 w-12 shrink-0 rounded-full border border-bronze/20 px-0"
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

            <p className="inline-flex items-center rounded-full border border-bronze/25 bg-bronze/8 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-bronze-glow">
              Available soon
            </p>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-bronze/10 pt-4">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-[0.68rem] text-foreground/42"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-bronze/55" strokeWidth={1.5} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>

      <Modal
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
        title="Size Guide"
        description="This tee is offered in S, M, L and XXL. A full measurement chart will be published when fulfilment opens."
      >
        <ul className="mt-2 space-y-1.5 text-sm text-foreground/65">
          {SIZES.map((size) => (
            <li key={size}>{size}</li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        title={`${selectedVariant.label} colourway`}
        description="Front and back views — Born to Roam T-Shirt."
      >
        <img
          src={selectedVariant.image}
          alt={`${product.alt} — ${selectedVariant.label.toLowerCase()} colourway, expanded`}
          className="mt-2 max-h-[70vh] w-full object-contain"
        />
      </Modal>
    </PageShell>
  );
});
