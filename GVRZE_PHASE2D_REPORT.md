# GVRZE Phase 2D — persistence migration report

**Date:** 14 October 2026  
**Commit/push:** none  
**Locks / Rewards redirect / Phase 2A–2C assets:** unchanged  
**Schema / auth / payments / routes / env / product IDs:** unchanged  
**localStorage was not cleared**

Public (`:8080`) and admin (`:8081`) do **not** share origin, so persist keys are not shared between apps. Supabase auth tokens (`sb-*`) were not remapped.

---

## Stores and keys inspected

| Owner | Legacy key | Adapter | Version / notes |
|-------|------------|---------|-----------------|
| `cartStore` | `geoverze.cart` | Zustand persist → localStorage | version 2; lines + saved |
| `bookmarksStore` | `geoverze.bookmarks` | Zustand persist | quiz bookmark ids |
| `preferencesStore` | `geoverze.preferences` | Zustand persist | version 3 + `migrate` for retired toggles |
| `profileStore` | `geoverze.profile` | Zustand persist | editor fields + joinedAt |
| `onboardingStore` | `geoverze.onboarding` | Zustand persist | signup journey |
| `communityStore` | `geoverze.community` | Zustand persist | version 1; likes/follows |
| `studioStore` | `geoverze.studio` | Zustand persist | drafts + UI chrome |
| `libraryStore` + `library-store-persistence` | `geoverze.library.v1.{scope}` | Custom scoped StateStorage | Zustand `name` was unused as the disk key |
| `storeStore` + `store-store-persistence` | `geoverze.store.v2.{scope}` | Custom scoped StateStorage | Plus older unscoped `geoverze.store` lift |
| `notification-persistence` | `geoverze.notifications.v1.{userId}` | Direct localStorage | dismiss/read cache |
| `QuizResultScreen` | `geoVerze.quiz.lastResult` | sessionStorage | tab-scoped last result |
| Admin `use-theme` | `geoverze-admin-theme` | Direct localStorage | `"light"` \| `"dark"` |
| `authStore` | none | Session lives in supabase-js | **Not migrated** |
| Credit / gameplay stores | none persisted under `geoverze.*` | — | **Not migrated** |

---

## Keys migrated (write `gvrze.*`, dual-read legacy)

| New key | Legacy retained |
|---------|-----------------|
| `gvrze.cart` | `geoverze.cart` |
| `gvrze.bookmarks` | `geoverze.bookmarks` |
| `gvrze.preferences` | `geoverze.preferences` |
| `gvrze.profile` | `geoverze.profile` |
| `gvrze.onboarding` | `geoverze.onboarding` |
| `gvrze.community` | `geoverze.community` |
| `gvrze.studio` | `geoverze.studio` |
| `gvrze.library` (Zustand name) / `gvrze.library.v1.{scope}` | `geoverze.library.v1.{scope}` |
| `gvrze.store.scoped` (Zustand name) / `gvrze.store.v2.{scope}` | `geoverze.store.v2.{scope}` |
| `gvrze.store` (unscoped lift) | `geoverze.store` |
| `gvrze.notifications.v1.{userId}` | `geoverze.notifications.v1.{userId}` |
| `gvrze.quiz.lastResult` | `geoVerze.quiz.lastResult` |
| `gvrze-admin-theme` | `geoverze-admin-theme` |

---

## Compatibility behavior

Implemented in `src/lib/persist-key-migration.ts`:

1. **Prefer** a non-empty `gvrze.*` value. Never overwrite it with legacy.
2. If the new key is **absent**, read the matching legacy key. If the value is usable, **copy** it to the new key and return it.
3. **Writes** go only to the new key. Legacy keys are not updated and **not deleted**.
4. Empty / `"null"` / `"undefined"` strings are treated as missing.
5. Storage throws (quota, private mode) are caught; hydration continues without crashing.
6. A second run is a no-op on already-copied data (idempotent).
7. Zustand `version` / `migrate` / `partialize` for cart and preferences are unchanged.

Admin theme: same prefer-new / copy-legacy / write-new-only rule, only for `"light"` and `"dark"`.

---

## Tests performed

Project has **no Vitest/Jest suite**. Added Node’s built-in test runner:

```
npm run test:persist
```

(`node --experimental-strip-types --test src/lib/persist-key-migration.test.ts`)

| Case | Result |
|------|--------|
| Legacy cart migrates when `gvrze.cart` is absent | Pass |
| Existing `gvrze.bookmarks` wins over stale `geoverze.bookmarks` | Pass |
| Empty / `"null"` legacy does not hydrate | Pass |
| Throwing storage does not crash | Pass |
| Second read does not clobber newer primary data | Pass |
| Writes hit only the new key; `removeItem` leaves legacy | Pass |
| Unrelated `sb-*` keys are not remapped | Pass |

**9/9 passing.**

ESLint: persist helper, stores, library/store persistence, quiz result screen, admin `use-theme.tsx` — pass after Prettier wrap fixes.

Full `tsc` / Vite production build: **not re-run** (known pre-existing failures).

Browser cart/bookmarks/admin-theme click-through: **not re-run this pass** (logic covered by unit tests). Daily/Weekly/Leaderboard locks and Rewards `tab=rewards` were not edited.

---

## Legacy keys intentionally retained

All `geoverze.*` keys listed above, plus `geoverze-admin-theme` and `geoVerze.quiz.lastResult`. Delete them only after a release cycle confirms `gvrze.*` hydration in production.

---

## Remaining technical risks

- **Two copies can drift** after first write (legacy snapshot vs live `gvrze.*`). That is intentional so stale legacy cannot overwrite newer data.
- **Malformed JSON** on the *new* key is treated as present by the string check; Zustand persist then fails parse and hydrates defaults **without** falling back to legacy (avoids clobbering a deliberate empty/corrupt new slot).
- **SSR:** `createBrandStateStorage` no-ops when `localStorage` is undefined.
- **Auth tokens** remain on supabase-js keys; do not rename them with this helper.
- Optional later: a one-release cleanup to `removeItem` legacy keys after analytics show `gvrze.*` adoption.
