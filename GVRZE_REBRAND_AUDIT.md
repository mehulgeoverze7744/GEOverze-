# GVRZE rebrand — Phase 1 audit

**Status:** Inventory and naming map only. No application code, assets, routes, or database objects were renamed.  
**Date:** 14 October 2026  
**Branch:** `main` (tracks `origin/main`)  
**Remote:** `https://github.com/mehulgeoverze7744/GEOverze-.git`  
**Working tree at audit time:** uncommitted Daily/Weekly lock and Rewards-nav work in `geoverze-public-main` was **left untouched**. This file is the only new artifact.

---

## 1. Repository structure reviewed

Workspace root: `C:\Users\pansa\OneDrive\Desktop\GEOverze`

| Area | Path | Role |
|------|------|------|
| Public app | `geoverze-main/geoverze-public-main` | TanStack Start + TanStack Router (file routes), React 19, Vite 8, Tailwind 4, Supabase client, Three.js globe |
| Admin app | `geoverze-admin/geoverze-continuation-main` | TanStack Start admin console (users, quizzes, library, store, credits, moderation, settings) |
| Database | `supabase/` | 57 SQL migrations + seed/scripts. **No** `config.toml`, **no** `functions/` (edge functions), **no** `.env.example` |
| Root lockfile | `package-lock.json` | Present at workspace root; apps have their own `package.json` |

**Public app architecture**

- Site chrome: `src/config/site.ts` (`name`, slogan, tagline, domain, nav)
- Wordmark: `src/components/shared/BrandMark.tsx` → `@/assets/geoverze-emblem.png`
- Layouts: `Navbar`, `Footer`, `PageShell`, `UniverseBackground`
- Features: play, quiz, pvp, multiplayer, draw-guess, imposter, library, store, community, studio, dashboard, profile, progression, pricing, marketing, history-rewards
- Routes: `src/routes/` (`/`, `/play/*`, `/geolibrary/*`, `/geostore/*`, `/community/*`, `/studio/*`, `/_app/*`, auth, legal)
- Persistence: Zustand keys `geoverze.*` in `src/stores/`
- Auth: Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — keys only; values not recorded)

**Admin architecture**

- Shell: `AppSidebar` (“GEOverze” / “Admin Console”), `src/lib/nav.ts`
- Auth gate: session + `admin` / `super_admin`
- Theme persist key: `geoverze-admin-theme`

**Not found in-repo**

- GitHub Actions under `.github/`
- PWA `manifest.json` / service worker (public app)
- Supabase Edge Functions
- Auth email HTML templates (those live in the Supabase dashboard if configured)
- Secret values (`.env` files were not opened)

---

## 2. Totals by category

Case-insensitive `geoverze` / `GEOverze` / `GEOVERZE` matches (excluding `node_modules`, `.output`, `dist`):

| Category | Approx. files | Approx. hits | Notes |
|----------|---------------|--------------|--------|
| 1. Visible brand text | ~180 | ~600+ | Nav, SEO titles, legal, merch copy, admin chrome |
| 2. Internal code identifier | ~40 | ~80 | `WhyGeoverze*`, `GeoCreditsModule`, folder `components/geoverze/`, persist keys |
| 3. File or folder name | ~25 dirs/files | n/a | `geoverze-main`, `geoverze-admin`, `geoverze-emblem.png`, hoodie-typo assets |
| 4. Asset or media reference | ~40 | ~80 | Product alts, merch filenames, rewards cards |
| 5. Database / backend identifier | ~8 SQL/scripts | ~40 | **Content/seed and comments**, not table names |
| 6. External / deployment | ~15 | ~50 | `geoverze.com`, GitHub remote, Lovable, placeholder emails |
| 7. Historical / legal | ~10 | ~40 | `terms.tsx`, `privacy.tsx`, docs, `.lovable/plan/*` |

**Public app only:** ~239 files, **~950–1,050** `geoverze` occurrences (hotspot: route `head()` meta).  
**Product names** `GEOstore` / `GEOlibrary` / `GEO Credits`: ~188 additional files (many overlap with the brand search).

**Unrelated “GEO” (do not treat as brand by default)**

- Quiz/game enums: `geography_countries`, slugs `geography-basics`
- UI kit: `GeoButton`, `GeoField`, `GeoDrawer`, `GeoDropdown`, `GeoTooltip`, `geo-segmented-*` CSS
- Globe/earth assets: `public/assets/globe/`, `BronzeGlobe`, `earthGlobeAssets`
- Educational copy: “geography”, “geographic”, map captions

---

## 3. Old-brand reference inventory

Line numbers are given for canonical / high-leverage files. Route SEO follows a repeated `{Page} — GEOverze` pattern in ~100 `src/routes/*.tsx` files (listed by path, not every meta line).

### 3.1 Visible brand text

| Path | Lines / pattern | Example |
|------|-----------------|---------|
| `geoverze-main/geoverze-public-main/src/config/site.ts` | 7–16, 31–32 | `name: "GEOverze"`; nav **GEOlibrary**, **GEOstore**; `domain: "geoverze.com"` |
| `geoverze-main/geoverze-public-main/src/components/shared/BrandMark.tsx` | 16–18, wordmark via `site.name` | “Official GEOverze emblem” |
| `geoverze-main/geoverze-public-main/src/components/layout/Footer.tsx` | 129 | `© {year} {site.name}. {site.slogan}. {site.tagline}.` |
| `geoverze-main/geoverze-public-main/src/routes/__root.tsx` | 62–69 | Title, author, `og:site_name` **GEOverze** |
| `geoverze-main/geoverze-public-main/src/routes/index.tsx` | head() | “GEOverze — Discover Earth Like Never Before” |
| `geoverze-main/geoverze-public-main/src/routes/terms.tsx` | ~12 hits | Legal “GEOverze team…” |
| `geoverze-main/geoverze-public-main/src/routes/privacy.tsx` | ~10 hits | Privacy policy brand |
| `geoverze-main/geoverze-public-main/src/features/marketing/components/home/WhyGeoverze*.tsx` | multiple | “Why GEOverze” |
| `geoverze-main/geoverze-public-main/src/features/studio/components/StudioSidebar.tsx` | visible + aria | “GEOverze” / “GEOverze home” |
| Almost all public `src/routes/*.tsx` `head()` | 2–6 hits each | `{title} — GEOverze`, OG tags, `geoverze.com` canonicals |
| Admin `app-sidebar.tsx` | brand lockup | **GEOverze** + Admin Console |
| Admin `LoginPage.tsx` | copy | **GEOverze Admin**; placeholder `you@geoverze.com` |
| Admin route titles | pattern | `… — GEOverze Admin` |
| `hoodieMerchSpecs.ts` | 72–124 | Hoodie titles/descriptions **GEOverze** / **GEOverze Doodle** |
| `products.ts` | 91, 108, 325+, 818 | Collection copy; “GEOverze Atlas (PDF)” |
| `productImages.ts` | 53–150 | Alts “GEOverze {product}…” |
| `categoryBanners.ts` | 12–56 | Alts “GEOverze T-shirts/Hoodies/…” |
| Seed `20260815140000_phase3a_quiz_seed.sql` | quiz creator | **GEOverze Studio** |
| Seed `20260901130000_phase_gl4_library_seed.sql` | titles/captions | “— GEOlibrary”; “GEOverze map engine” |

### 3.2 Internal code identifiers

| Identifier | Path | Rename now? |
|------------|------|-------------|
| `WhyGeoverze`, `WhyGeoverzeCarousel`, `WhyGeoverzeIntro` | `src/features/marketing/components/home/` | Optional later (internal) |
| `why-geoverze-section.css`, `why-geoverze-carousel.css` | same | Optional later |
| `GeoCreditsModule` | dashboard | **Propose** with currency name |
| `GeostoreLayout`, `GeostoreCartButton`, … | store | **Propose** with store name |
| `GeoArticleReader` | library | Ambiguous (GEO product vs generic) |
| `src/components/geoverze/` | globe | Optional folder rename |
| Zustand `geoverze.bookmarks`, `.cart`, `.community`, `.library`, `.onboarding`, `.preferences`, `.profile`, `.store.scoped`, `.studio` | `src/stores/*` | **Compatibility required** (localStorage) |
| Admin `geoverze-admin-theme` | `use-theme.tsx` | Compatibility required |
| `GeoButton` / `GeoField` / `GeoDrawer` | shared UI | **Keep** — design-system prefix, not product brand |

### 3.3 File and folder names

- Workspace folders: `geoverze-main`, `geoverze-public-main`, `geoverze-admin`, `geoverze-continuation-main`
- Docs: `docs/geoverze-prd.md`, `docs/geoverze-roadmap.md`
- Emblem: `src/assets/geoverze-emblem.png`
- Merch: `hoodie-geoverze-typo-*.png`, `public/assets/store/Hoodies/geoverze typo/*.png`
- Rewards art: `public/assets/rewards/geoverze-*.jpg|png`
- Ecosystem: `public/assets/home/ecosystem/geolibrary.jpg`, `geostore.jpg`
- Asset folders: `src/assets/geostore/`, `public/assets/geolibrary/`

### 3.4 Asset / media references

See §5. Filenames and `alt`/`title` strings are the main in-repo hooks; **printed wordmarks on mockups require new art**.

### 3.5 Database / backend

**Do not rename** tables, RPCs, buckets, or enums for brand reasons.

| Object | Brand? | Action |
|--------|--------|--------|
| Tables `library_*`, store/order/billing tables | No brand in names | Keep |
| Bucket `library-media` | No | Keep |
| Enums `geography_countries` | Generic geography | Keep |
| Slugs `geography-basics` | Generic | Keep |
| Seed creator `'GEOverze Studio'` | Visible content | New seed / content update **after** approval; old rows stay |
| `seo_canonical_path` values `/geolibrary/article/…` | Route + SEO | Only if URL migration approved |
| Migration **comments** mentioning GEOlibrary / GEO credits | Historical | May remain |

### 3.6 External / deployment

| Reference | Where | In-repo change? |
|-----------|--------|-----------------|
| GitHub `mehulgeoverze7744/GEOverze-` | `git remote` | External (repo rename optional) |
| `https://geoverze.com` | `site.ts`, robots, sitemap, OG, JSON-LD | Domain/DNS/legal — **external** |
| Lovable project + `@lovable.dev/vite-tanstack-config` | both apps | External dashboard |
| Placeholder emails `*@geoverze.com`, `support@geoverze.io` | admin mocks / settings | Copy + later real mail |
| `cdn.geoverze.io` | admin ops mock | External if ever real |
| Razorpay / Stripe provider rows | migrations | **Do not rename providers** |
| Social accounts | `site.ts` placeholders | External when live |

### 3.7 Historical / legal (may stay)

- `terms.tsx`, `privacy.tsx` — counsel should review whether historical “GEOverze” must remain in archives
- `docs/geoverze-prd.md`, `docs/geoverze-roadmap.md`, `docs/design-system.md`
- `.lovable/plan/*` planning notes
- Applied SQL migrations already on remote (do not rewrite history)

### 3.8 Complete file list (public + admin + supabase, `geoverze` match)

Ripgrep reported **322 files** with ≥1 match under typical source globs. Highest-count public files:

- `src/features/marketing/data/geostoreMerch.ts` (24)
- `src/features/store/data/productImages.ts` (21)
- `src/features/store/data/hoodieMerchSpecs.ts` (17)
- `docs/geoverze-roadmap.md` (14)
- `docs/geoverze-prd.md` (13)
- `docs/design-system.md` (13)
- `why-geoverze-section.css` (13)
- `src/routes/terms.tsx` (12)
- `WhyGeoverze.tsx` (11)
- `src/routes/privacy.tsx` (10)
- `public/sitemap.xml` (~14 URL hosts)
- Plus ~100 route files with 2–6 SEO hits each

Admin: most `src/routes/*.tsx` titles; `README.md`; `ops/data.ts`; `LoginPage.tsx`; `nav.ts`; mock data.  
Supabase: listed in §3.5 plus `supabase/scripts/generate_gl4_seed.ts` (9) and chunked seed SQL.

A machine-readable dump of every remaining path is the same 322-file ripgrep set from Phase 1; re-run:

`rg -i geoverze -g '!node_modules' -g '!.output' -g '!dist' --files-with-matches`

---

## 4. Proposed brand-family naming map

**Approved in principle (do not apply until Phase 2):**

| Existing | Proposed | Surfaces | Risk |
|----------|----------|----------|------|
| GEOVERZE / GEOverze / Geoverze / geoverze (brand word) | **GVRZE** | Visible copy, SEO, wordmark, merch titles, admin chrome, docs | Safe for UI strings. Persist keys and domains need handling (below). |

**Product names — proposed for review (do not apply yet)**

| Existing | Proposed | Used in | Why | Affects | Risk |
|----------|----------|---------|-----|---------|------|
| **GEOstore** | **GVRZE Store** | Nav, store pages, admin “GEOstore Products”, SEO, `/geostore` | GEO- prefix is brand-family, not generic “geo” | Visible + admin. **Routes `/geostore*` stay** unless URL migration approved | Compatibility if URLs change |
| **GEOlibrary / GeoLibrary** | **GVRZE Library** | Nav, library SEO, article kicker, admin nav, seed titles “— GEOlibrary” | Same | Visible + seed content. **Routes `/geolibrary*` stay** unless approved | Compatibility if URLs change |
| **GEO Credits / Geo Credits / GEOcredit / GeoCredits** | **GVRZE Credits** | Dashboard module, credit history, store redemption, admin credits, pricing | Currency is branded; “credits” alone is generic | Visible labels only. **Do not rename** SQL columns (`credits`, ledgers, RPCs) | Safe if display-only |
| **GEOverze Studio** | **GVRZE Studio** | Quiz creator seed, studio UI, merch “designed by” | Creator org name | Visible + seed rows | Content update, not schema |
| **GEOverze Admin / Control Center** | **GVRZE Admin** | Admin sidebar, login, titles | Parent brand | Visible | Safe |
| **GEOstore merchandise / “GEOverze collection”** | Product titles → **GVRZE** + existing product names (e.g. “GVRZE Doodle”) | Store catalogue, alts, hoodies | Printed + digital labels | Visible + **new artwork** | High (print/mockup) |
| **Know Earth** | **Retain** | `site.slogan`, footer, OG, hoodie `hoodie-know-earth-think-global` | Requested retain; possible TM/tagline review | Visible + merch art | Legal review |
| **Think Global** | **Retain** | `site.tagline`, footer, OG, same hoodie | Same | Same | Legal review |

**Other names**

| Name | Recommendation |
|------|----------------|
| Let's Play, Community, Pricing, Studio (creator) | Keep |
| GeoButton / GeoField / GeoDrawer / geo-segmented | **Keep** — UI kit, not trademark |
| `geography_*` enums, “geography” in quizzes | **Keep** — generic |
| Package `tanstack_start_ts` | Keep (not customer-facing) |
| Domain `geoverze.com` | **External decision** (acquire `gvrze.com` or keep domain with new wordmark) |
| Emails `@geoverze.com` / `@geoverze.io` | External |

**Suggested URL policy (needs explicit approval to change)**

- Default Phase 2: **keep** `/geostore`, `/geolibrary` (compatibility). Change labels only.
- Optional later: `/store`, `/library` already appear in `public/sitemap.xml` (legacy mismatch). If adopted, add **301 redirects** from `/geostore/*` and `/geolibrary/*`.

---

## 5. Assets that need updating or recreation

### Can update in code (text / filename / import)

- Wordmark string via `site.name` + `BrandMark` (after new emblem file)
- Favicon `/favicon.png` (swap file, keep path to avoid cache chaos — or add new + HTML)
- SEO titles/descriptions, sitemap host (only when domain decided)
- Image `alt` text and product `name` / `description` strings
- CSS comments / “Why GEOverze” section titles

### Require new design or regeneration

| Asset | Why |
|-------|-----|
| `src/assets/geoverze-emblem.png` | Primary mark; likely letterforms |
| `hoodie-geoverze-typo-*.png` and `public/.../geoverze typo/` | Wordmark printed on garment |
| `hoodie-know-earth-think-global.jpg` | Slogan lockup; **retain slogans pending legal** |
| Mug/globe/cap mockups whose art includes a GEOverze mark (`mugGalleries.ts` alts say so) | Printed mark |
| `public/assets/rewards/geoverze-*.jpg|png` | Card chrome / wordmark |
| OG / social preview images if any baked wordmark exists (no dedicated og:image file found in `__root`; still verify hosted images) | Social |
| Admin login mark if it uses the same emblem | Shared |

### Preserve visually

Cinematic dark-space background, bronze/gold, globe, typography (Chakra Petch + existing type), layout, responsive hub — **out of scope for rename**.

---

## 6. Backend and integration risks

| Change | Class | Notes |
|--------|-------|-------|
| UI string GEOverze → GVRZE | **Safe** | `site.ts` + route heads + admin titles |
| Product labels GEOstore / GEOlibrary | **Safe** if routes unchanged | |
| Zustand `geoverze.*` keys | **Compatibility** | Users lose cart/library/prefs unless dual-read old keys |
| Admin theme key | **Compatibility** | Theme reset once |
| SQL table/RPC/enum/bucket rename | **Do not do** | Breaks clients, RLS, admin |
| Seed “GEOverze Studio” / article titles | **Compatibility** | Update new seeds; leave historical rows or run content UPDATE after approval |
| `seo_canonical_path` `/geolibrary/...` | **Compatibility** | Tied to public routes |
| Env var **names** | **Do not rename** without dual-support | `VITE_SUPABASE_*` have no brand |
| OAuth / redirect URLs | **External** | Supabase Auth allow-list still `geoverze.com` until domain change |
| Stripe/Razorpay | **External** | Dashboard business name, not schema |
| Lovable sync | **External** | Two apps connected; keep branches working |
| GitHub repo name | **External** | Optional; remotes/CI |

**Gameplay to preserve:** quiz engine, Solo/PvP/Multiplayer, Draw & Guess, Imposter, credit math, rewards redemption, profiles, admin roles — none depend on the display brand string.

---

## 7. Routes and redirects

| Current route | Phase 2 default | If URL migration approved |
|---------------|-----------------|---------------------------|
| `/geostore`, `/geostore/*` | Keep | 301 → `/store/*` |
| `/geolibrary`, `/geolibrary/*` | Keep | 301 → `/library/*` |
| Sitemap `/store`, `/library` | Already listed; **mismatch** with app | Align sitemap to live routes first |
| `/play/rewards` | Already redirects to profile Rewards (current WIP) | Unrelated to brand |
| All other `/play/*`, `/community/*`, `/studio/*`, `/_app/*` | Keep | No brand in path |

---

## 8. External services (manual)

1. Domain registrar / DNS / SSL (`geoverze.com` vs future `gvrze.com`)
2. Supabase project: Auth site URL, redirect allow-list, email templates, Storage public URLs
3. Lovable project display name and publish URLs (public + admin)
4. GitHub: repo name `GEOverze-`, owner `mehulgeoverze7744`, social preview
5. Payment dashboards (Razorpay/Stripe) statement descriptor / brand
6. Analytics / email (PostHog, Postmark — admin mocks only today)
7. Search Console / social OG after domain or title change
8. App store / PWA — N/A today (no manifest)

---

## 9. Phased implementation plan (after naming approval)

**Do not start until the map in §4 is approved.**

0. **Freeze** — commit or stash current WIP separately; do not mix with rebrand.  
1. **Canonical copy** — `site.ts` (`name` only if slogans stay), Footer inherits; BrandMark wordmark.  
2. **SEO pass** — `__root.tsx` + scripted update of route `head()` titles/OG (pattern replace **GEOverze** in titles only).  
3. **Admin chrome** — sidebar, login, document titles, `nav.ts` labels (GEOstore/GEOlibrary **only if approved**).  
4. **Marketing / legal** — Why GVRZE, About, Support, Terms/Privacy (legal review).  
5. **Store/library UI strings** — eyebrows, search, dashboard cards; **not** route files.  
6. **Merch catalogue strings** — then **new art** for typographic hoodies/emblem.  
7. **Persist-key dual-read** — write `gvrze.*`, read `geoverze.*` fallback.  
8. **Docs + sitemap/robots** — after domain decision.  
9. **Content SQL** — optional UPDATE for display strings; **never** rewrite applied migrations.  
10. **External dashboards** — domain, Auth, Lovable, GitHub.  
11. **Optional URL migration** — last, with 301s and canonical updates.

---

## 10. Validation and rollback

**Validation**

- [ ] Home, nav, footer show approved names; slogans unchanged unless approved  
- [ ] Tab titles / OG `site_name`  
- [ ] `/geostore` and `/geolibrary` still resolve  
- [ ] Play: solo, PvP, multiplayer, rooms  
- [ ] Credits earn/redeem numbers unchanged  
- [ ] Auth sign-in / OAuth  
- [ ] Admin login and library/store tools  
- [ ] Cart/bookmarks survive persist-key migration  
- [ ] Lint / tsc / visual pass desktop + mobile  
- [ ] No secrets committed  

**Rollback**

- Revert the rebrand commit(s) only; do not reset `main` over unrelated WIP  
- Persist dual-read keeps old keys readable  
- Do not revert remote SQL  
- CDN/favicon caches may need hard refresh  

---

## Naming map — approval needed before Phase 2

| Item | Proposal | Decision |
|------|----------|----------|
| Parent brand | GVRZE | Approved in principle |
| Store | **GVRZE Store** (route stays `/geostore`) | **Needs approval** |
| Library | **GVRZE Library** (route stays `/geolibrary`) | **Needs approval** |
| Currency | **GVRZE Credits** (DB columns stay `credits`) | **Needs approval** |
| Studio / Admin | **GVRZE Studio** / **GVRZE Admin** | **Needs approval** |
| Know Earth / Think Global | Retain | Legal review |
| GeoButton and `geography_*` | Keep | Recommended |
| Domain `geoverze.com` | Keep until separately decided | External |
| Zustand `geoverze.*` | Dual-read then new `gvrze.*` | Recommended |

---

## Gaps (not assumed clean)

- Hosted Supabase Auth email templates — **not in repo**  
- Production env files — **not opened**  
- Raster files without “geoverze” in the filename that still show the wordmark — **need a visual pass**  
- Nested git / Lovable remotes inside app folders — public app is part of this monorepo remote; Lovable history rules still apply  
- `package-lock.json` at repo root contains a `geoverze` path string (tooling only)
