# GVRZE Phase 2C — merchandise and brand asset report

**Date:** 14 October 2026  
**Commit/push:** none  
**Product IDs, SKUs, prices, cart, inventory:** unchanged  
**Navbar, Daily/Weekly/Leaderboard locks, Rewards redirect, persist keys, Phase 2A/2B:** unchanged  
**Originals:** kept on disk beside new `gvrze-*` files

---

## Assets replaced (wired)

New files live under `geoverze-main/geoverze-public-main`. Imports point only at files that exist.

### Typographic hoodies (5)

| New file | Original kept | Colour |
|----------|---------------|--------|
| `src/assets/geostore/hoodie-gvrze-typo-white.jpg` | `hoodie-geoverze-typo-white.png` | White |
| `hoodie-gvrze-typo-pink.jpg` | `hoodie-geoverze-typo-pink.png` | Pink |
| `hoodie-gvrze-typo-burgundy.jpg` | `hoodie-geoverze-typo-burgundy.png` | Burgundy |
| `hoodie-gvrze-typo-brown.jpg` | `hoodie-geoverze-typo-brown.png` | Brown |
| `hoodie-gvrze-typo-black.jpg` | `hoodie-geoverze-typo-black.png` | Black |

Printed **GVRZE** on chest, back, labels. Globe/map layout retained. Product id remains `hoodie-geoverze-typo`.

### Doodle hoodies (5)

`hoodie-gvrze-doodle-{white,pink,burgundy,brown,black}.jpg` — doodled **GVRZE** in place of GEOVERZE. Originals `hoodie-doodle-*.png` kept.

### Know Earth hoodie (1)

`hoodie-gvrze-know-earth-think-global.jpg` — chest/back wordmark **GVRZE**; **KNOW EARTH** / **THINK GLOBAL** retained. Original `hoodie-know-earth-think-global.jpg` kept. Product remains `listed: false`.

### T-shirt chest logos

| Family | Colourways replaced | Listing image |
|--------|---------------------|---------------|
| Born to Roam | black, blue, burgundy, olive, off-white + hero | `tshirt-gvrze-born-to-roam.jpg` |
| Know the Capital | 5 | off-white default |
| Recalculating | 5 | burgundy default |
| GPS Trust Issues | 5 | blue default |
| Too Close? Perfect | 5 | olive default |
| Common Sense (hidden) | 1 | `tshirt-gvrze-common-sense-geography.jpg` |
| My Country Is Better (hidden) | 1 | `tshirt-gvrze-my-country-is-better.jpg` |

Slogans kept. Chest **GEOverze** → **GVRZE**. IDs and prices unchanged.

### Homepage / ecosystem

| New file | Use |
|----------|-----|
| `public/assets/rewards/gvrze-merchandise.jpg` | Monthly rewards merch slot (`rewardsCard.ts`) |
| `public/assets/home/ecosystem/gvrze-geostore.jpg` | Home ecosystem GVRZE Store tile |

Originals `geoverze-merchandise.jpg` and `geostore.jpg` kept.

---

## Files changed (code)

- `src/features/store/data/hoodieMerchSpecs.ts`
- `src/features/store/data/hoodieLookbookCrop.ts` — typo/doodle crops set to 1024×1024 lookbooks (`photoHeight` 740 / 720)
- `src/features/store/data/apparelMerchSpecs.ts`
- `src/features/marketing/data/geostoreMerch.ts`
- `src/features/marketing/data/rewardsCard.ts`
- `src/features/marketing/data/home.ts`
- `src/features/store/components/BornToRoamProductPage.tsx`
- `src/features/store/components/KnowTheCapitalProductPage.tsx`
- `src/features/store/components/TooClosePerfectProductPage.tsx`

---

## Assets still pending / archive

| Asset | Why pending |
|-------|-------------|
| `public/assets/store/Hoodies/geoverze typo/*` and `doodle/*` | Duplicate public copies **not imported** by the app. Still old printed wordmarks. Leave as archive or replace later in lockstep. |
| `public/assets/rewards/geoverze-rewards-card-content.png` | Unused baked plate; live card uses HTML overlay + `gvrze-merchandise.jpg`. |
| `geoverze-rewards-card-source.jpg` | Design source only. |
| Slogan-only hoodies, map mugs, favicon, blank rewards frame, `geolibrary.jpg` | Confirmed keep (no old wordmark, or slogan-only). Hangtags not exhaustively re-inspected. |
| Unused leftover JPGs (`tshirt-recalculating-since-2024.jpg`, `tshirt-i-know-the-capital.jpg`, etc.) | Not imported. |

Designer polish still useful: generated type sometimes reads slightly irregular (e.g. doubled “Know Earth” relief, lookbook chrome). **GEOverze / GEOVERZE is gone** from the wired replacements. Optional later: tighter letter-spacing to match the official wordmark.

---

## Validation

| Check | Result |
|-------|--------|
| Direct read of replacement JPGs | GVRZE on typo, doodle, Know Earth, tees, merch still-life. No GEOVERZE on those files. |
| Home `/` | Loads. Rewards slot titled Exclusive GVRZE Merchandise. Merch rail titles unchanged. Navbar GVRZE. |
| `/geostore/product/hoodie-geoverze-typo` | Lookbook loads; **GVRZE** on chest/back; 5 colour swatches; crop shows garment (not only the detail strip). Price $74 / 700 credits. |
| `/geostore/product/tshirt-born-to-roam` | PDP loads; 5 colours; slogan copy unchanged. |
| ESLint on merch data files | Pass (`hoodieMerchSpecs`, `hoodieLookbookCrop`, `apparelMerchSpecs`, `geostoreMerch`, `rewardsCard`, `home`). |
| ESLint on BornToRoam / TooClosePerfect | Pre-existing prettier wrap on description copy (unrelated to imports). Not “fixed” to avoid drive-by edits. |
| Full `tsc` / production build | Not re-run (known pre-existing failures). |
| Mobile viewport | Not separately resized. Crops are CSS aspect ratios; desktop PDP crop looked correct. |

---

## Intentionally unchanged

- Favicon globe  
- Blank rewards frames  
- Slogan-only hoodie lookbooks (`every-point`, `same-planet`, `world-unfiltered`)  
- Map mugs  
- Product slugs including `hoodie-geoverze-typo`  
- Storage keys `geoverze.*`
