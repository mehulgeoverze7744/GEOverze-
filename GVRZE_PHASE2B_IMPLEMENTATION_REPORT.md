# GVRZE Phase 2B implementation report

**Date:** 14 October 2026  
**Commit/push:** none  
**Persist keys:** unchanged (`geoverze.*`, `geoverze-admin-theme`)  
**Locks / Rewards redirect / Phase 2A copy:** left in place

---

## Files changed

| File | Change |
|------|--------|
| `geoverze-main/geoverze-public-main/src/assets/gvrze-emblem.png` | **New** 1024×1024 circular medal with transparent corners. Printed **GVRZE** on the rim. Original `geoverze-emblem.png` kept. |
| `geoverze-main/geoverze-public-main/src/components/shared/BrandMark.tsx` | Import switched from `geoverze-emblem.png` to `gvrze-emblem.png`. Layout sizes unchanged. |
| `geoverze-main/geoverze-public-main/src/routes/terms.tsx` | Customer-facing GEOverze → GVRZE in title, OG, description, and body. Canonical/OG URL still `https://geoverze.com/terms`. |
| `geoverze-main/geoverze-public-main/src/routes/privacy.tsx` | Same brand swap. Structure and practices unchanged. Canonical still `https://geoverze.com/privacy`. |
| `supabase/migrations/20261014140000_gvrze_quiz_display_labels.sql` | **New additive UPDATE only. Not applied** to staging or production. |
| `GVRZE_PHASE2B_IMPLEMENTATION_REPORT.md` | This report. |

Removed unused leftover `src/assets/gvrze-emblem.jpg` (not imported).

Admin does not import the public emblem (Lucide Globe2 / ShieldCheck).

`BrandMark` surfaces that now show the new medal: Navbar, Footer, AuthLayout, HomeHero, StudioSidebar, LoadingScreen, OrbitalMark, CreatorStudioPreview.

---

## Old-brand references resolved

- Navbar / footer / hero / auth / studio / loading **printed medal text** (new pixels, not alt-only).
- Terms and Privacy **browser titles, OG titles, descriptions, visible body**.
- Admin/static fallbacks were already **GVRZE Studio** from Phase 2A (`quiz-mapper.ts`, quiz builder placeholder).

Not resolved in the live UI until a database/CMS action: quiz card creator `GEOverze Studio` and title `GEOverze CMS test quiz`.

---

## Database / CMS — applied vs proposed

**Source of live cards:** `fetchPublishedQuizzes()` → `public.quizzes.title` / `creator`. Not static `src` fixtures.

**Read-only query results**

| Environment | Project | Rows with old brand |
|-------------|---------|---------------------|
| Staging | Geoverze staging | `q-flag-blitz`, `q-atlas-sprint` creator `GEOverze Studio`. No CMS test quiz. |
| Production | Geoverze Production | Same two creators **plus** `q-geoverze-cms-test-quiz` titled `GEOverze CMS test quiz`, creator `GEOverze Studio`. |
| Local public app | `.env.local` points at **Production** | Explains why the CMS test quiz appeared on `:8080`. |

**CMS test quiz content** (6 questions; title chosen from actual items): capital of France; seven continents; Japan; Machu Picchu; pin Gibraltar; match country→continent. Types: typed, boolean, single, map, drag-drop. Proposed title: **Question Types Sampler**.

**Applied this session:** none. No `UPDATE` was run against staging or production.

**Proposed SQL** (also in the new migration; IDs, slugs, questions, scoring, ownership unchanged):

```sql
update public.quizzes
set creator = 'GVRZE Studio'
where creator = 'GEOverze Studio';

update public.quizzes
set title = 'Question Types Sampler'
where id = 'q-geoverze-cms-test-quiz'
  and title = 'GEOverze CMS test quiz';
```

Do not rewrite `20260815140000_phase3a_quiz_seed.sql`.

**Admin CMS alternative:** edit creator on Flag Blitz / Atlas Sprint; rename only the title of `q-geoverze-cms-test-quiz`.

Approve a reviewed production/staging run if Let's Play cards should change without a full migration deploy.

---

## Artwork replaced vs awaiting creation

| Asset | Path | Dimensions / notes | Referenced from | Status |
|-------|------|--------------------|-----------------|--------|
| Primary medal | `src/assets/gvrze-emblem.png` | 1024×1024 circular PNG | `BrandMark.tsx` | **Replaced.** Original `geoverze-emblem.png` retained. Bottom rim still matches the source medal’s “Know Earth” lettering (the original also used a doubled-letter relief). Optional polish: tighter “Know Earth” spelling and globe relief. |
| Favicon globe | `public/favicon.png` | 64×64 | HTML | **Keep** (no wordmark) |
| Typographic hoodies | `src/assets/geostore/hoodie-geoverze-typo-{white,pink,burgundy,brown,black}.png` plus `public/assets/store/Hoodies/geoverze typo/` | White measured ~1312×1199 | `hoodieMerchSpecs.ts`, `geostoreMerch.ts` | **Awaiting** 5-colour GVRZE lookbook. Do not point imports at missing files. |
| Doodle hoodies | `src/assets/geostore/hoodie-doodle-{black,white,pink,burgundy,brown}.png` | Square lookbook | `hoodieMerchSpecs.ts` | **Awaiting** GVRZE doodle set |
| Know Earth hoodie | `src/assets/geostore/hoodie-know-earth-think-global.jpg` | 1024×558 | `geostoreMerch.ts` | **Awaiting** (keep slogans; change printed GEOverze only) |
| Born to Roam / chest-logo tees | `tshirt-born-to-roam.jpg` and colourways | Landscape mockups | `geostoreMerch.ts`, `BornToRoamProductPage.tsx` | **Awaiting** chest GVRZE or globe-only lockup |
| Home merch still-life | `public/assets/rewards/geoverze-merchandise.jpg` | 1024×682 | `rewardsCard.ts` | **Awaiting** |
| Blank rewards frame, library ecosystem, map mugs, slogan-only hoodies | various | — | Rewards / store | **Keep** |

Full keep/replace classification: `GVRZE_BRAND_ASSET_PLAN.md`. No merch originals were overwritten.

---

## Checks performed

| Check | Result |
|-------|--------|
| ESLint `BrandMark.tsx`, `terms.tsx`, `privacy.tsx` | Pass (`--max-warnings 0`) |
| Home `http://localhost:8080/` | Title **GVRZE — Discover Earth Like Never Before**; nav wordmark GVRZE; hero medal wired to new asset |
| `/terms` | Title **Terms & Conditions — GVRZE**; body uses GVRZE; no leftover GEOverze in the route file |
| `/privacy` | Title **Privacy Policy — GVRZE** (verified earlier this pass) |
| `/play` | Title **Let's Play — GVRZE**. Catalogue showed **0 quizzes match** (live fetch empty this pass). Old titles remain in production until SQL/CMS. Daily/Weekly/Practice/Tournament **Coming soon** disabled. Leaderboard control disabled. Footer “Leaderboard Soon”. |
| Rewards redirect | Unchanged: `/play/rewards` → `/quiz-history-and-rewards?tab=rewards`; ProgressionNav Rewards uses the same search. |
| Persist keys | Untouched |
| Full `tsc` / production Vite build | **Not re-run** (known pre-existing failures) |

---

## Remaining / legal / external

- **Counsel:** “The GVRZE name … [is] owned by GVRZE” is a display-name swap only. Entity, trademark assignment, governing law, and jurisdiction were **not** changed and should be reviewed by a qualified legal professional. No new warranties, liabilities, refund, or privacy practices were invented.
- **Canonical host** still `https://geoverze.com/...`.
- **Quiz labels** stay old until the SQL above is applied on the database the app uses (currently production for local `.env.local`).
- **Merch photography** still prints GEOverze on garments and the homepage still-life.
- Domain, Auth email templates, GitHub, Lovable, payments: external and out of scope.
- Dual-read persist-key migration remains a **separate** task.
