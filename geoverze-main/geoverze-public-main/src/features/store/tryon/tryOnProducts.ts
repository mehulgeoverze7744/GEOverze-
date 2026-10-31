/**
 * Try-On Studio catalogue.
 *
 * Builds a wearable-only garment list from every GStore apparel source:
 * storefront signature tees, listed merch colourways, and the static PRODUCTS
 * catalogue. Newly added eligible items appear automatically. Products without
 * a garment image are omitted rather than faked.
 */
import {
  geostoreMerchProducts,
  isMerchProductListed,
  merchProductById,
  type GeostoreMerchProduct,
  type MerchCategory,
} from "@/features/marketing/data/geostoreMerch";

import { APPAREL_MERCH_SPECS } from "../data/apparelMerchSpecs";
import { HOODIE_MERCH_SPECS, hoodieColorsWithImages } from "../data/hoodieMerchSpecs";
import { productImageForSlug } from "../data/productImages";
import { PRODUCTS, productBySlug, type Product, type StockState } from "../data/products";
import { STOREFRONT_TEES, type StorefrontTeeProduct } from "../storefront/storefront-product-data";
import { money } from "../lib/format";

export const TRY_ON_CATEGORY_IDS = ["tshirts", "hoodies", "sweatshirts"] as const;
export type TryOnCategoryId = (typeof TRY_ON_CATEGORY_IDS)[number];

export const TRY_ON_CATEGORY_LABELS: Record<TryOnCategoryId, string> = {
  tshirts: "T-Shirts",
  hoodies: "Hoodies",
  sweatshirts: "Sweatshirts",
};

export const TRY_ON_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export type TryOnColor = {
  id: string;
  label: string;
  hex: string;
  /** Actual colour-variant garment photo. */
  image: string;
  /** Optional dedicated back-view asset. */
  backImage?: string;
};

export type TryOnGarment = {
  id: string;
  slug: string;
  name: string;
  category: TryOnCategoryId;
  price: number | null;
  credits: number | null;
  priceLabel: string;
  sizes: readonly string[];
  colors: readonly TryOnColor[];
  stock: StockState;
  comingSoon: boolean;
  defaultColorId: string;
  /** Cart / checkout payload — existing Product shape. */
  product: Product;
};

const SIGNATURE_SWATCH: Record<string, TryOnColor> = {
  "midnight-black-tshirt": {
    id: "black",
    label: "Black",
    hex: "#111111",
    image: "/assets/gvrze-storefront/best-sellers/midnight-black-tshirt.webp",
  },
  "cherry-blossom-tshirt": {
    id: "black",
    label: "Black",
    hex: "#111111",
    image: "/assets/gvrze-storefront/best-sellers/cherry-blossom-tshirt.webp",
  },
  "golden-arc-tshirt": {
    id: "black",
    label: "Black",
    hex: "#111111",
    image: "/assets/gvrze-storefront/best-sellers/golden-arc-tshirt.webp",
  },
  "new-age-tshirt": {
    id: "black",
    label: "Black",
    hex: "#111111",
    image: "/assets/gvrze-storefront/best-sellers/new-age-tshirt.webp",
  },
};

const DEFAULT_SIZES = ["S", "M", "L", "XL"] as const;

function merchCategoryToTryOn(category: MerchCategory): TryOnCategoryId {
  return category === "hoodie" ? "hoodies" : "tshirts";
}

function formatPriceLabel(price: number | null, credits: number | null, fallback?: string): string {
  if (fallback) return fallback;
  if (price !== null) return money(price);
  if (credits !== null) return `${credits.toLocaleString("en-US")} credits`;
  return "—";
}

function productSizes(product: Product): readonly string[] {
  const size = product.options.find((option) => option.label === "Size");
  return size?.values.length ? size.values : DEFAULT_SIZES;
}

function merchToProduct(merch: GeostoreMerchProduct, category: TryOnCategoryId): Product {
  const existing = productBySlug(merch.id);
  if (existing) return existing;

  return {
    id: merch.id,
    slug: merch.id,
    name: merch.title,
    tagline: merch.tagline,
    description: merch.tagline,
    category,
    group: "merch",
    price: merch.price,
    compareAt: null,
    credits: merch.credits,
    mode: "hybrid",
    rating: 0,
    reviews: 0,
    popularity: 0,
    stock: "in-stock",
    releasedAt: "",
    limited: false,
    featured: false,
    bestSeller: false,
    options: [
      { label: "Size", values: DEFAULT_SIZES },
      { label: "Colour", values: [] },
    ],
    features: [],
    specs: [],
    tags: ["apparel", merch.categoryLabel.toLowerCase()],
    comingSoon: false,
  };
}

function signatureToProduct(tee: StorefrontTeeProduct, color: TryOnColor): Product {
  const existing = productBySlug(tee.id);
  if (existing) return existing;

  return {
    id: tee.id,
    slug: tee.id,
    name: tee.name,
    tagline: tee.description.slice(0, 96),
    description: tee.description,
    category: "tshirts",
    group: "merch",
    price: 37_00,
    compareAt: null,
    credits: 300,
    mode: "hybrid",
    rating: 4.8,
    reviews: 0,
    popularity: 96,
    stock: "in-stock",
    releasedAt: "2026-10-01",
    limited: false,
    featured: true,
    bestSeller: true,
    options: [
      { label: "Size", values: DEFAULT_SIZES },
      { label: "Colour", values: [color.label] },
    ],
    features: tee.highlights,
    specs: [],
    tags: ["apparel", "t-shirt", "signature"],
    comingSoon: false,
  };
}

function colorsFromMerch(slug: string, merch: GeostoreMerchProduct): TryOnColor[] {
  const apparel = APPAREL_MERCH_SPECS[slug];
  if (apparel) {
    return apparel.colors.map((color) => ({
      id: color.id,
      label: color.label,
      hex: color.hex,
      image: color.image,
    }));
  }

  const hoodie = HOODIE_MERCH_SPECS[slug];
  if (hoodie) {
    return hoodieColorsWithImages(hoodie.colors).map((color) => ({
      id: color.id,
      label: color.label,
      hex: color.hex,
      image: color.image,
    }));
  }

  if (merch.image) {
    return [
      {
        id: merch.defaultColor ?? "default",
        label: merch.defaultColor ? titleCase(merch.defaultColor) : "Default",
        hex: "#111111",
        image: merch.image,
      },
    ];
  }

  return [];
}

function titleCase(value: string): string {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function displayNameForMerch(slug: string, merch: GeostoreMerchProduct): string {
  return APPAREL_MERCH_SPECS[slug]?.title ?? HOODIE_MERCH_SPECS[slug]?.title ?? merch.title;
}

function fromSignature(tee: StorefrontTeeProduct): TryOnGarment | null {
  const color = SIGNATURE_SWATCH[tee.id];
  if (!color?.image) return null;
  const product = signatureToProduct(tee, color);
  return {
    id: tee.id,
    slug: tee.id,
    name: tee.name,
    category: "tshirts",
    price: product.price,
    credits: product.credits,
    priceLabel: tee.priceLabel,
    sizes: DEFAULT_SIZES,
    colors: [color],
    stock: "in-stock",
    comingSoon: false,
    defaultColorId: color.id,
    product,
  };
}

function fromMerch(merch: GeostoreMerchProduct): TryOnGarment | null {
  if (!isMerchProductListed(merch)) return null;
  const colors = colorsFromMerch(merch.id, merch);
  if (!colors.length) return null;

  const category = merchCategoryToTryOn(merch.category);
  const product = merchToProduct(merch, category);
  const defaultColor = colors.find((color) => color.id === merch.defaultColor) ?? colors[0];

  return {
    id: merch.id,
    slug: merch.id,
    name: displayNameForMerch(merch.id, merch),
    category,
    price: merch.price,
    credits: merch.credits,
    priceLabel: formatPriceLabel(merch.price, merch.credits),
    sizes: productSizes(product),
    colors,
    stock: product.stock,
    comingSoon: product.comingSoon,
    defaultColorId: defaultColor?.id ?? colors[0]!.id,
    product: {
      ...product,
      options: [
        { label: "Size", values: productSizes(product) },
        { label: "Colour", values: colors.map((color) => color.label) },
      ],
    },
  };
}

function fromCatalogueProduct(product: Product): TryOnGarment | null {
  if (product.comingSoon) return null;
  if (product.category !== "tshirts" && product.category !== "hoodies") return null;

  const merch = merchProductById(product.slug);
  if (merch) return fromMerch(merch);

  const image = productImageForSlug(product.slug)?.src;
  if (!image) return null;

  const colorOption = product.options.find((option) => option.label === "Colour");
  const firstColour = colorOption?.values[0] ?? "Default";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    credits: product.credits,
    priceLabel: formatPriceLabel(product.price, product.credits),
    sizes: productSizes(product),
    colors: [
      {
        id: firstColour.toLowerCase().replace(/\s+/g, "-"),
        label: firstColour,
        hex: "#111111",
        image,
      },
    ],
    stock: product.stock,
    comingSoon: product.comingSoon,
    defaultColorId: firstColour.toLowerCase().replace(/\s+/g, "-"),
    product,
  };
}

let cached: readonly TryOnGarment[] | null = null;

/** All apparel currently eligible for Try-On Studio. */
export function getTryOnGarments(): readonly TryOnGarment[] {
  if (cached) return cached;

  const seen = new Set<string>();
  const garments: TryOnGarment[] = [];

  const push = (garment: TryOnGarment | null) => {
    if (!garment || seen.has(garment.slug)) return;
    seen.add(garment.slug);
    garments.push(garment);
  };

  // Signature tees first — they are the Figma studio default.
  for (const tee of STOREFRONT_TEES) {
    push(fromSignature(tee));
  }

  for (const merch of geostoreMerchProducts) {
    push(fromMerch(merch));
  }

  for (const product of PRODUCTS) {
    push(fromCatalogueProduct(product));
  }

  cached = garments;
  return cached;
}

export function getTryOnGarmentBySlug(slug: string): TryOnGarment | undefined {
  return getTryOnGarments().find((garment) => garment.slug === slug);
}

export function garmentsInCategory(category: TryOnCategoryId | "all"): readonly TryOnGarment[] {
  const all = getTryOnGarments();
  if (category === "all") return all;
  return all.filter((garment) => garment.category === category);
}

export function tryOnColorById(garment: TryOnGarment, colorId: string): TryOnColor | undefined {
  return garment.colors.find((color) => color.id === colorId) ?? garment.colors[0];
}

/** Garment image used for AI try-on and the editorial preview. */
export function tryOnGarmentImage(
  garment: TryOnGarment,
  colorId: string,
  view: "front" | "back" = "front",
): string {
  const color = tryOnColorById(garment, colorId);
  if (!color) return "";
  if (view === "back" && color.backImage) return color.backImage;
  return color.image;
}
