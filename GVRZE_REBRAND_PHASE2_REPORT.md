# GVRZE rebrand — Phase 2A report

**Status:** Core public and admin **copy/labels** migrated. Routes, schema, persist keys, domains, and assets were not renamed.  
**Date:** 14 October 2026  
**Branch:** `main`  
**Commit/push:** none  
**Existing WIP:** Daily/Weekly locks (`availability.ts`) and `/play/rewards` → profile Rewards tab remain in the working tree.

---

## 1. Files changed

Approximately **360+** application source files under:

- `geoverze-main/geoverze-public-main/src/` (site config, routes `head()`, marketing, store, library, dashboard, settings, support, studio, play metadata)
- `geoverze-admin/geoverze-continuation-main/src/` (sidebar, login, `nav.ts`, route titles, admin copy)

**Not modified (by design)**

- `src/routes/terms.tsx`, `src/routes/privacy.tsx`
- `supabase/**` migrations and seeds
- `docs/**`, `.lovable/**`
- Zustand persist keys (`geoverze.*`)
- Admin theme key `geoverze-admin-theme`
- Route file names (`geostore.*`, `geolibrary.*`)
- Image files (no deletes, no overwrites)
- Env var names, OAuth, payment providers

**Preserved WIP (logic intact; labels only where they already used old product names)**

- `src/features/progression/lib/availability.ts` (untracked; Daily/Weekly flags)
- `src/routes/play.rewards.tsx` (redirect to `/quiz-history-and-rewards?tab=rewards`)
- `ProgressionNav` Rewards `search: { tab: "rewards" }`
- `GeoCreditsModule` Rewards link still goes to the profile Rewards tab

---

## 2. Brand changes implemented

| Surface | Result |
|---------|--------|
| `src/config/site.ts` | `name: "GVRZE"`; slogans **Know Earth** / **Think Global** unchanged; `domain`/`url` still `geoverze.com` |
| Nav / footer | **GVRZE Library**, **GVRZE Store**; Let's Play / Community unchanged |
| Footer lockup | `© {year} {site.name}. {site.slogan}. {site.tagline}.` → GVRZE + slogans |
| `BrandMark` | Wordmark uses `site.name` (GVRZE). Emblem file still `geoverze-emblem.png` |
| Root metadata | `__root.tsx` reads `site.name` / `site.description` / `site.url` for title, author, `og:site_name`, JSON-LD |
| Route `head()` | Titles and descriptions use **GVRZE**; canonical hosts still `https://geoverze.com/...` |
| Homepage | “Why GVRZE” eyebrow and carousel `aria-label` |
| Store / library UI | Eyebrows, breadcrumbs, CTAs: **GVRZE Store** / **GVRZE Library** |
| Credits | Visible “GVRZE Credits” (e.g. dashboard module). Component remains `GeoCreditsModule` |
| Studio | Seed/placeholder **GVRZE Studio**; sidebar lockup “Creator Studio / GVRZE” |
| Admin | Sidebar **GVRZE**; login **GVRZE Admin**; nav **GVRZE Library** / **GVRZE Store**; titles `— GVRZE Admin` |
| Merch catalogue **strings** | Titles/alts/descriptions say GVRZE. **Printed art is unchanged** |

Internal identifiers **kept:** `WhyGeoverze*`, `GeoButton`, `GeoField`, `GeoDrawer`, `Geostore*` components, `geography_*`, `/geostore`, `/geolibrary`.

---

## 3. Checks performed and results

| Check | Result |
|-------|--------|
| Git topology | Single repo at workspace root. No nested `.git` in public or admin apps |
| Persist keys | Still `geoverze.cart`, `.library`, `.bookmarks`, `.preferences`, `.profile`, `.onboarding`, `.community`, `.studio`, `.store.scoped` |
| Routes | `/geostore` and `/geolibrary` file routes unchanged |
| Rewards WIP | `play.rewards.tsx` still redirects with `tab: "rewards"` |
| Daily/Weekly lock | `DAILY_CHALLENGES_AVAILABLE` / `WEEKLY_CHALLENGES_AVAILABLE` still `false` |
| ESLint (core rebrand + WIP files) | **Pass** (`--max-warnings 0`) |
| ESLint (admin `nav.ts`, sidebar, login, `__root`) | **Pass** (then full-project `tsc` reported pre-existing errors) |
| `tsc --noEmit` public | **Fails** on pre-existing errors (BronzeGlobe textures, draw-room RPCs, `exactOptionalPropertyTypes`, etc.). No hits on `site.ts` / WhyGeoverze / BrandMark |
| `tsc --noEmit` admin | **Fails** on pre-existing library mapper / `notReadyNow` / quiz_questions types |
| Production `vite build` | **Not re-run** this phase (last run already failed on pre-existing Nitro `URIError`) |
| Browser walkthrough | **Not run** — starting a long-lived dev server was blocked in this environment. Visual/nav confirmation still needed locally |

---

## 4. Remaining old-brand references

### 1. Public-facing — still need a later pass (or legal/art work)

- `geoverze-public-main/src/routes/terms.tsx` and `privacy.tsx` (left untouched)
- Printed wordmarks on hoodies, rewards cards, emblem, some mug/cap/globe mockups (see §5)
- Contact emails `hello@geoverze.com` (`features/marketing/data/contact.ts`)
- Placeholder profile email `explorer@geoverze.com`
- Sitemap / robots / OG canonicals still hosted on `geoverze.com`

### 2. Technical identifiers — retained on purpose

- Folder/file names: `geoverze-main`, `geoverze-admin`, `geoverze-emblem.png`, `hoodie-geoverze-typo-*`, `why-geoverze-*.css`, `components/geoverze/`
- Components: `WhyGeoverze`, `GeoButton`, `GeoCreditsModule`, `GeostoreLayout`, `GeostoreCartButton`, `GeoArticleReader`
- DOM id `geoverze-universe-background`
- Zustand `geoverze.*` keys
- Admin `geoverze-admin-theme`
- Routes `/geostore`, `/geolibrary`
- `geography_*` enums and quiz slugs

### 3. Historical / legal — review required

- Terms and Privacy body copy (still “GEOverze”)
- `docs/geoverze-prd.md`, `docs/geoverze-roadmap.md`, `docs/design-system.md`
- `.lovable/plan/*`
- Applied SQL migrations and seed rows (`GEOverze Studio`, article titles “— GEOlibrary”, canonical paths `/geolibrary/...`)

### 4. External / manual

- GitHub `mehulgeoverze7744/GEOverze-`
- Domain DNS, SSL, Search Console
- Supabase Auth site URL, redirect allow-list, email templates
- Lovable project names
- Stripe / Razorpay statement descriptors
- Admin mock emails `@geoverze.com` / `@geoverze.io`, `cdn.geoverze.io`

---

## 5. Assets still needing replacement

**Do not treat a filename or alt-text change as a new mark.** Original files were not deleted.

| Asset | Work needed |
|-------|-------------|
| `src/assets/geoverze-emblem.png` | New GVRZE emblem |
| `/favicon.png` | New icon once emblem exists |
| `hoodie-geoverze-typo-*.png` and `public/assets/store/Hoodies/geoverze typo/` | New typographic hoodie art |
| `hoodie-know-earth-think-global` | Slogans retained; only regenerate if the old wordmark is on-garment |
| `public/assets/rewards/geoverze-*.jpg\|png\|webp` | New reward chrome if the old wordmark is baked in |
| Mug / globe / cap mockups that print a GEOverze mark | Visual pass + new renders |
| `public/assets/home/ecosystem/geolibrary.jpg`, `geostore.jpg` | Filenames can stay; replace only if they show old wordmarks |

Artwork that is only geographic (globe, maps, slogan-only tees without the old name) can stay.

---

## 6. Compatibility issues and unresolved decisions

| Topic | Status |
|-------|--------|
| Persist-key migration `geoverze.*` → `gvrze.*` | **Not started** (requires dual-read + test) |
| Domain `geoverze.com` | Unchanged; separate plan required |
| Route paths `/geostore`, `/geolibrary` | Kept as approved |
| SQL seed / live content strings | Not updated (do not rewrite applied migrations) |
| Legal documents | Flagged, not edited |
| Sitemap `/store` vs `/geostore` mismatch | Pre-existing; not part of this phase |
| Full-app `tsc` / production build | Pre-existing failures; not introduced by copy changes |

**Implementation note:** A first string pass briefly broke `WhyGeoverze*` identifiers because a placeholder contained `GEOVERZE`. Those four files were restored to `WhyGeoverze` / `WhyGeoverzeIntro` / `WhyGeoverzeCarousel` and linted.

---

## 7. Suggested Phase 2B (not started)

1. Local browser pass: Home, nav, footer, `/geostore`, `/geolibrary`, dashboard credits, admin login/sidebar, Daily/Weekly Coming Soon, Rewards redirect.
2. Dual-read persist-key migration (tested).
3. Legal rewrite of Terms/Privacy after counsel.
4. New emblem + merch/rewards art; swap files without deleting originals (add `gvrze-emblem.png` beside the old file).
5. Optional content UPDATE for seed “GVRZE Studio” on **new** rows only.
6. External dashboards when a domain plan exists.
