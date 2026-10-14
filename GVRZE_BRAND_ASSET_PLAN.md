# GVRZE brand asset replacement plan

**Status:** Inventory only. No artwork was generated, overwritten, or deleted.  
**Inspection method:** Direct image reads of priority files plus live public app at `http://localhost:8080` (desktop 1920×1080).  
**Rule:** A filename containing `geoverze` is not proof of a printed wordmark.

Replacement files should be **added beside** originals (e.g. `gvrze-emblem.png`) and wired in code later. Keep the old files until every surface is swapped and cached.

---

## Confirmed: old name is printed on the image

| Path | Size / ratio | Current use | Printed brand | Replacement | Referenced from |
|------|--------------|-------------|---------------|-------------|-----------------|
| `geoverze-public-main/src/assets/geoverze-emblem.png` | 512×512 (1:1) | Navbar, footer, auth, studio, BrandMark | **GEOVERZE** + **KNOW EARTH** on bronze medal | New 512×512 (and 1024×1024) GVRZE emblem; keep Know Earth if slogans stay | `BrandMark.tsx` |
| `src/assets/geostore/hoodie-geoverze-typo-{white,pink,burgundy,brown,black}.png` | White measured 1312×1199 (~1.09) | Store PDP `/geostore/product/hoodie-geoverze-typo`, lookbook | **GEOverze** chest, back, hangtag, lookbook type | New 5-colour lookbook with **GVRZE** wordmark, same crop (`hoodieLookbookCrop.ts` `TYPO`) | `hoodieMerchSpecs.ts`, `geostoreMerch.ts` |
| `public/assets/store/Hoodies/geoverze typo/*.png` | Same family | Duplicate public copies | Same typographic wordmark | Replace in lockstep with `src/assets` set | Store public folder |
| `src/assets/geostore/hoodie-know-earth-think-global.jpg` | 1024×558 (~1.84) | Merch catalogue / hoodie PDP | Chest + back **GEOVERZE**; slogans Know Earth / Think Global | New mockup: slogans **retained**, wordmark → GVRZE | `geostoreMerch.ts` |
| `src/assets/geostore/hoodie-doodle-{black,white,pink,burgundy,brown}.png` | Lookbook ~square | “GVRZE Doodle” PDP (title already GVRZE) | **GEOverze / GEOVERZE** doodled across garment and chrome | New doodle set spelling GVRZE | `hoodieMerchSpecs.ts` |
| `src/assets/geostore/tshirt-born-to-roam.jpg` (and colourways) | Landscape mockup | Home merch rail, tee PDP | Small chest **GEOverze** + globe; back is slogan-only | New chest mark (GVRZE or globe-only) | `geostoreMerch.ts`, store tees |
| Other statement tees (`tshirt-know-the-capital`, `tshirt-gps-trust-issues`, `tshirt-recalculating-*`, `tshirt-too-close-perfect`, `tshirt-common-sense-geography`) | Same mockup language | Store / home | **Likely same chest wordmark** (confirmed pattern on Born to Roam; remaining colourways need a visual pass) | Recreate chest logo or globe-only lockup | Apparel specs + merch data |
| `public/assets/rewards/geoverze-merchandise.jpg` | 1024×682 (~1.50) | Home rewards carousel “Exclusive GVRZE Merchandise” | **GEOverze™** on tee, hoodie, cap, globe, stickers | New still-life with GVRZE marks | `rewardsCard.ts` |
| `public/assets/rewards/geoverze-rewards-card-content.png` | 856×427 (~2.00) | Source/content for rewards card | Third slot: **Exclusive GEOverze Merchandise** | New content plate or rely on live HTML overlay (`RewardsCard.tsx` already overlays GVRZE copy) | Marketing rewards |
| `public/assets/rewards/geoverze-rewards-card-source.jpg` | 1024×571 (~1.79) | Design source (green-screen) | Same baked “GEOverze Merchandise” | Archive; do not ship as-is | Source only |
| `public/assets/home/ecosystem/geostore.jpg` | 1024×636 (~1.61) | Home ecosystem “GVRZE Store” tile | Small chest wordmark on hanging hoodie (illegible at card size, still old mark) | Optional retouch; low priority at current crop | `home.ts` / Ecosystem |

---

## Filename only, or generic geography (do not replace for brand)

| Path | Size / ratio | Why it can stay |
|------|--------------|-----------------|
| `public/favicon.png` | 64×64 (1:1) | Bronze globe coin; **no wordmark**. Optional later swap to match new emblem. |
| `public/assets/rewards/geoverze-rewards-card-blank.jpg` | 992×1024 (~0.97) | Empty bronze frame, stars, no text. |
| `public/assets/rewards/geoverze-rewards-card-blank-transparent.png` / `.webp` | Frame | Used as `CARD_FRAME_ART` in `RewardsCard.tsx`. No wordmark. |
| `public/assets/home/ecosystem/geolibrary.jpg` | 1024×636 | Globe + atlas; no brand letters. |
| `src/assets/geostore/hoodie-every-point-has-a-story-*.png` | Lookbook | Slogan + map; **no GEOverze**. |
| `src/assets/geostore/hoodie-same-planet-*`, `hoodie-world-unfiltered-*`, `hoodie-earth-from-space.jpg`, `hoodie-earth-intelligence.jpg` | Lookbook | Slogan / globe art. Spot-check hangtags only. |
| `src/assets/geostore/golden-atlas-mug-studio-main.jpg` and other mug/globe stills inspected | Product | Map / globe glaze; **no wordmark** on the mug sample. |
| `public/assets/rewards/iphone-duo.jpg`, `ps5.jpg`, `lets-play-emblem.png` | Rewards | Product photos / Let's Play mark, not GEOverze. |
| Globe textures, quiz thumbs, library article photos | Various | Geography content. |

---

## Not found / not running

| Surface | Finding |
|---------|---------|
| Dedicated `og:image` file | No branded OG image file in `__root`; social cards will use default + title. |
| Admin login art | Admin uses Lucide `ShieldCheck` / `Globe2`, not the public emblem. **Admin app was not running** (8081 refused). |
| Email / PWA splash | Not in repo. |

---

## Recommended replacement order

1. **Emblem** (512 and 1024) + optional favicon derived from it.  
2. **Typographic hoodie set** (5 colours) — highest-contrast old wordmark.  
3. **Doodle hoodie set** + Know Earth hoodie (wordmark only).  
4. **Chest-logo tees** (Born to Roam confirmed; rest of tee family).  
5. **Merchandise still-life** used on the home rewards card.  
6. Optional: ecosystem store tile, rewards content PNG if still used as pixels.

**Validation after each swap:** Home nav mark, store PDP, home merch/rewards, no broken imports, original files still on disk.

**Dependencies:** `BrandMark` import path; hoodie crop rectangles in `hoodieLookbookCrop.ts`; merch `id` slugs (`hoodie-geoverze-typo`) can stay until a later URL cleanup.
