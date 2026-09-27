export type HoodieLookbookCrop = {
  sheetWidth: number;
  sheetHeight: number;
  photoHeight: number;
};

const SHEET_1312 = { sheetWidth: 1312, sheetHeight: 1199 } as const;
const SHEET_1254 = { sheetWidth: 1254, sheetHeight: 1254 } as const;

const EVERY_POINT = { ...SHEET_1312, photoHeight: 863 } as const;
const DOODLE_SQUARE = { ...SHEET_1254, photoHeight: 799 } as const;
const DOODLE_BLACK = { ...SHEET_1312, photoHeight: 786 } as const;
const TYPO = { ...SHEET_1312, photoHeight: 880 } as const;
const SAME_PLANET = { ...SHEET_1312, photoHeight: 858 } as const;
const UNFILTERED = { ...SHEET_1312, photoHeight: 846 } as const;

/** Category cards use the listed default colourway photo. */
const PRODUCT_CARD_CROP: Record<string, HoodieLookbookCrop> = {
  "hoodie-every-point-has-a-story": EVERY_POINT,
  "hoodie-doodle": DOODLE_SQUARE,
  "hoodie-geoverze-typo": TYPO,
  "hoodie-same-planet": SAME_PLANET,
  "hoodie-world-unfiltered": UNFILTERED,
};

const VARIANT_CROP: Record<string, HoodieLookbookCrop> = {
  "hoodie-every-point-has-a-story:white": EVERY_POINT,
  "hoodie-every-point-has-a-story:pink": EVERY_POINT,
  "hoodie-every-point-has-a-story:burgundy": EVERY_POINT,
  "hoodie-every-point-has-a-story:brown": EVERY_POINT,
  "hoodie-every-point-has-a-story:black": EVERY_POINT,
  "hoodie-doodle:white": DOODLE_SQUARE,
  "hoodie-doodle:pink": DOODLE_SQUARE,
  "hoodie-doodle:burgundy": DOODLE_SQUARE,
  "hoodie-doodle:brown": DOODLE_SQUARE,
  "hoodie-doodle:black": DOODLE_BLACK,
  "hoodie-geoverze-typo:white": TYPO,
  "hoodie-geoverze-typo:pink": TYPO,
  "hoodie-geoverze-typo:burgundy": TYPO,
  "hoodie-geoverze-typo:brown": TYPO,
  "hoodie-geoverze-typo:black": TYPO,
  "hoodie-same-planet:white": SAME_PLANET,
  "hoodie-same-planet:pink": SAME_PLANET,
  "hoodie-same-planet:burgundy": SAME_PLANET,
  "hoodie-same-planet:brown": SAME_PLANET,
  "hoodie-same-planet:black": SAME_PLANET,
  "hoodie-world-unfiltered:white": UNFILTERED,
  "hoodie-world-unfiltered:pink": UNFILTERED,
  "hoodie-world-unfiltered:burgundy": UNFILTERED,
  "hoodie-world-unfiltered:brown": UNFILTERED,
  "hoodie-world-unfiltered:black": UNFILTERED,
};

export function hoodieLookbookCropForProduct(productId: string): HoodieLookbookCrop | undefined {
  return PRODUCT_CARD_CROP[productId];
}

export function hoodieLookbookCropForVariant(
  productId: string,
  colorId: string,
): HoodieLookbookCrop | undefined {
  return VARIANT_CROP[`${productId}:${colorId}`] ?? PRODUCT_CARD_CROP[productId];
}

export function hoodieLookbookPhotoAspect(crop: HoodieLookbookCrop): string {
  return `${crop.sheetWidth} / ${crop.photoHeight}`;
}

export function hoodieLookbookThumbHeight(crop: HoodieLookbookCrop): string {
  return `${(crop.sheetHeight / crop.photoHeight) * 100}%`;
}
