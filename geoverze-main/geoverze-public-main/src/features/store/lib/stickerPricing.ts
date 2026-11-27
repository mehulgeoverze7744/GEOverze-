/**
 * @deprecated Import from `gstoreDualPricing.ts` instead.
 * Kept for backwards-compatible imports during the Gstore hybrid rollout.
 */
export {
  GSTORE_PAYMENT_OPTION_KEY,
  GSTORE_PAYMENT_INR,
  GSTORE_PAYMENT_CREDITS,
  type GstorePaymentMethod,
  STICKER_PAYMENT_OPTION_KEY,
  STICKER_PAYMENT_INR,
  STICKER_PAYMENT_CREDITS,
  type StickerPaymentMethod,
  productSupportsDualPayment,
  gstorePaymentMethodFromOptions,
  stickerPaymentMethodFromOptions,
  gstoreCartOptions,
  stickerCartOptions,
  formatDualPriceShort,
  formatDualPriceStacked,
  formatInrPayButtonLabel,
  dualPriceLabelForProduct,
  creditsDueForGstoreCreditLines,
  creditsDueForStickerLines,
  isGstoreCreditsCartLine,
  isStickerCreditsCartLine,
  isGstoreInrCartLine,
  cartLineUsesCreditsPayment,
  toGstoreDualPaymentCartLine,
  toStickerCartLine,
  assertHomogeneousGstoreCheckout,
} from "./gstoreDualPricing.ts";

export { GSTORE_STICKER_CREDITS } from "./gstoreProductPrices.ts";

import { SHOPPABLE_STICKER_SLUGS } from "../data/catalogAvailability.ts";
import {
  GSTORE_STICKER_CREDITS,
  GSTORE_STICKER_PRICE_MINOR,
} from "./gstoreProductPrices.ts";
import { formatDualPriceShort, formatDualPriceStacked } from "./gstoreDualPricing.ts";

export function isShopableStickerSlug(slug: string): boolean {
  return SHOPPABLE_STICKER_SLUGS.has(slug);
}

/** @deprecated Use formatDualPriceShort(GSTORE_STICKER_PRICE_MINOR, GSTORE_STICKER_CREDITS) */
export function formatStickerDualPriceShort(): string {
  return formatDualPriceShort(GSTORE_STICKER_PRICE_MINOR, GSTORE_STICKER_CREDITS);
}

/** @deprecated Use formatDualPriceStacked(GSTORE_STICKER_PRICE_MINOR, GSTORE_STICKER_CREDITS) */
export function formatStickerDualPriceStacked(): string {
  return formatDualPriceStacked(GSTORE_STICKER_PRICE_MINOR, GSTORE_STICKER_CREDITS);
}

/** @deprecated Use dualPriceLabelForProduct or formatDualPriceShort with catalog values */
export function formatStickerPdpPriceLabel(): string {
  return formatDualPriceShort(GSTORE_STICKER_PRICE_MINOR, GSTORE_STICKER_CREDITS);
}