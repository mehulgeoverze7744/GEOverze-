# GVRZE Phase 2B audit

**Date:** 14 October 2026  
**Branch:** `main` (uncommitted Phase 2A + Daily/Weekly locks + Rewards redirect preserved)  
**Public app verified:** existing server `http://localhost:8080` (desktop ~1920×1080)  
**Application code:** not changed this phase  
**Commit/push:** none

Related: `GVRZE_REBRAND_PHASE2_REPORT.md`, `GVRZE_BRAND_ASSET_PLAN.md`

---

## 1. What was inspected

| Surface | How | Result |
|---------|-----|--------|
| Home `/` | Live browser | Title **GVRZE — Discover Earth Like Never Before**. Nav: Home, Let's Play, **GVRZE Library**, **GVRZE Store**, Community, Pricing. Footer **© 2026 GVRZE . Know Earth . Think Global**. Why GVRZE. Emblem still shows printed GEOVERZE. |
| Let's Play `/play` | Live | Title **Let's Play — GVRZE**. Game cards present. Practice / Daily / Weekly / Tournament CTAs **Coming soon**. **View leaderboard** disabled. |
| Rewards | Live `/play/rewards` | Redirected to `/quiz-history-and-rewards?tab=rewards`. Signed-out **Sign in to continue** (GVRZE). Tab query preserved. **Signed-in Rewards tab not opened.** |
| Store `/geostore` | Live | Labels **GVRZE Store**. Title is redundant: `GVRZE Store — GVRZE Store \| GVRZE`. Route unchanged. |
| Product `/geostore/product/hoodie-geoverze-typo` | Live | Heading **GVRZE**; gallery still prints **GEOverze**. |
| Library `/geolibrary` | Live | **GVRZE Library**. Hero “Know Earth. One entry at a time.” |
| Article `/geolibrary/article/why-some-countries-have-two-capitals` | Live (after load) | Title **… — GVRZE Library**. Kicker **GVRZE Library · Capitals & cities**. |
| Daily `/play/daily-challenges` | Live | **Daily challenges are locked** / Coming soon. |
| Weekly `/play/weekly-challenges` | Live | **Weekly challenges are locked**. |
| Leaderboard `/play/leaderboard` | Live | **Standings are locked**. Footer Leaderboard **Soon**. |
| Dashboard `/dashboard` | Live | Auth wall only. **GVRZE Credits module not seen.** |
| Terms `/terms` | Live | Title and body still **GEOverze** (intentional hold). |
| Admin | `http://localhost:8081/` | **No server.** Login/sidebar not browser-verified. |
| Mobile / tablet | — | **Not resized.** Desktop only. |
| Loading | Article first paint | “Loading entry…” then content. No old-brand flash in chrome. |

Existing WIP (locks, Rewards redirect, Phase 2A copy) behaved as intended on the routes above.

---

## 2. Remaining visible branding issues

### Confirmed in the running public app

1. **Navbar/footer emblem** — bronze medal still reads GEOVERZE / KNOW EARTH.  
2. **Legal** — `/terms` title and copy still GEOverze. `/privacy` not re-opened; same files were left untouched in Phase 2A.  
3. **Live quiz catalogue** — “by **GEOverze Studio**”, creator filter **GEOverze Studio**, quiz **GEOverze CMS test quiz**. These come from **CMS/seed data**, not from the static string pass.  
4. **Store imagery** — typographic hoodie, doodle hoodie, Know Earth hoodie, Born to Roam chest logo, home rewards merchandise photo.  
5. **Home rewards content art** — source PNG still says “Exclusive GEOverze Merchandise”; on-page HTML overlay already says GVRZE.  
6. **Store document title** — duplicated “GVRZE Store — GVRZE Store \| GVRZE”.

### Not verified in browser

- Signed-in dashboard **GVRZE Credits**  
- Signed-in Profile Rewards tab contents  
- Admin console  
- Mobile layout  
- `/leaderboard` (non-play) — footer lock seen; page itself not opened this pass  

### Broken / missing

- No broken store/library routes found on the pages opened.  
- Admin URL 8081 did not load (app not running).  
- Favicon is a globe (no wordmark); not broken.

---

## 3. Asset replacement plan (summary)

See `GVRZE_BRAND_ASSET_PLAN.md` for paths, sizes, and callers.

**Must recreate:** emblem; typo hoodie 5-pack; doodle hoodie set; Know Earth hoodie wordmark; merchandise still-life; tee chest logos (Born to Roam confirmed).  

**Keep:** blank rewards frame, favicon globe, library ecosystem photo, slogan-only hoodies (Every Point…), map mugs/globes without letters.

Do not delete originals when new files land.

---

## 4. Persistence migration proposal (not implemented)

### Current keys

| Key / pattern | Store | Version / migrate | Payload |
|---------------|-------|-------------------|---------|
| `geoverze.cart` | `cartStore` | `version: 2`, no `migrate` | `lines`, `saved` |
| `geoverze.bookmarks` | `bookmarksStore` | none | quiz `ids` |
| `geoverze.preferences` | `preferencesStore` | `version: 3`, `migrate` merges toggles, drops `starfield` | motion, units, locale, toggles |
| `geoverze.profile` | `profileStore` | none | displayName, username, bio, country, joinedAt |
| `geoverze.onboarding` | `onboardingStore` | none | step, age, interests, skill, avatar, completed |
| `geoverze.community` | `communityStore` | `version: 1` | likes, bookmarks, follows, polls, etc. |
| `geoverze.studio` | `studioStore` | none | sidebar, drafts |
| `geoverze.library` | Zustand persist **name** | unused as the real key | Custom adapter |
| `geoverze.library.v1.{scope}` | `library-store-persistence` | `{ state, version: 0 }` | bookmarks, likes, progress, completed… `anon` or userId |
| `geoverze.store.scoped` | Zustand persist **name** | unused as the real key | Custom adapter |
| `geoverze.store.v2.{scope}` | `store-store-persistence` | `{ state, version: 3 }` | wishlist, recentlyViewed, recentSearches |
| `geoverze.store` | **legacy** | `readLegacyStoreSnapshot()` one-time lift into anon | Same snapshot shape |
| `geoverze-admin-theme` | admin `use-theme.tsx` | raw `"light"` \| `"dark"` | Theme class |

Library and store already isolate users by scope and refuse to merge two users’ snapshots.

### Proposed dual-read (when approved)

1. Keep Zustand **schemas and version numbers**.  
2. Introduce a small `createBrandStorage()` wrapper:  
   - `getItem(newKey)`: if `gvrze.*` exists and parses, use it. Else read `geoverze.*`. If both exist, **never overwrite newer `gvrze` with legacy**.  
   - `setItem`: write **only** `gvrze.*` (and scoped `gvrze.library.v1.*` / `gvrze.store.v2.*`).  
   - Malformed JSON → treat as empty; do not throw.  
3. Map names 1:1 (`geoverze.cart` → `gvrze.cart`, same for bookmarks, preferences, profile, onboarding, community, studio, admin theme).  
4. For scoped keys, copy the **same scope suffix** (`anon`, user id).  
5. Reuse existing `readLegacyStoreSnapshot` pattern: lift `geoverze.store` only if the new scoped key is empty.  
6. Do not bump cart/preferences versions solely for the rebrand.  
7. **Retire legacy keys** only after: dual-read shipped, one production release, and either a TTL (e.g. 90 days) or explicit empty-legacy telemetry. Then `removeItem` on the old key after a successful new-key write (optional, later).

**Risks:** two tabs writing different key families; auth scope switch must flush the outgoing scope under **both** prefixes during the overlap window; do not rename keys in isolation without the adapter.

---

## 5. Unresolved risks

| Risk | Notes |
|------|--------|
| CMS/seed **GEOverze Studio** | Visible on Let's Play until content UPDATE (do not rewrite old SQL files). |
| Legal pages | Counsel before changing Terms/Privacy. |
| Printed merch vs UI titles | Users see GVRZE titles on GEOverze garments. |
| Persist migration | Not built; current keys must stay until dual-read is tested. |
| Domain / Auth / emails | Still `geoverze.com`. |
| Admin | Code already says GVRZE; UI not live-checked. |
| Dashboard credits | Code says GVRZE Credits; needs a signed-in session. |
| Responsive | Unverified. |
| Store title duplication | Cosmetic SEO only. |

---

## 6. Suggested next implementation slice (not started)

1. New emblem file + BrandMark import (keep old PNG).  
2. Content update for quiz creator display name (new writes / admin CMS), not migration rewrite.  
3. Persist dual-read behind a flag, with a cart + library + preferences test.  
4. Legal rewrite after review.  
5. Merch art batches per `GVRZE_BRAND_ASSET_PLAN.md`.
