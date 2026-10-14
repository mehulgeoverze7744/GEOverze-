# GVRZE Phase 3A — Final Rebrand Audit

**Date:** 14 October 2026  
**Git:** workspace root only (no nested `.git`). Branch `main` at `a3f390d` tracking `origin/main` (`feat(leaderboard): lock leaderboard until launch`). Remote `origin` = `https://github.com/mehulgeoverze7744/GEOverze-.git`. Other local branches: `dashboard-update`, `staging-validation`.  
**Commit / push / reset / stash / clean:** none. Working tree left intact.

This audit validates Phases 1–2D before any GitHub commits. Findings below distinguish **verified** (inspected or exercised) from **unverified**.

---

## 1. Working-tree protection

Inspected: `git status -sb`, `git branch -vv`, `git remote -v`, recursive `.git` search, recent log.

- Single repository boundary: `C:\Users\pansa\OneDrive\Desktop\GEOverze\.git`.
- Large dirty tree mixes **rebrand**, **locks/rewards**, **persist migration**, **new merch assets**, **unapplied quiz SQL**, and **unrelated admin/library/quiz-builder WIP**.
- Do **not** assume every modified file is rebrand work.

Preserved and not discarded:

- Daily, Weekly and Leaderboard locks.
- Rewards redirect to `/quiz-history-and-rewards?tab=rewards`.
- Phase 2A–2C branding and assets.
- Phase 2D persist helper, stores, admin theme hook, `npm run test:persist`.
- Prepared SQL `supabase/migrations/20261014140000_gvrze_quiz_display_labels.sql` (not executed).
- Unrelated admin/library/quiz-builder edits.

---

## 2. Remaining old-brand references

Search covered public `src`, admin `src`, Supabase scripts/seeds/applied migrations, docs, config, and asset plans. Generic geography words were not treated as brand hits. Applied SQL was not rewritten.

### Class 1 — Unapproved customer-facing branding

| Location | Notes | Status |
|----------|--------|--------|
| Live CMS quiz title `GEOverze CMS test quiz` and creator `GEOverze Studio` | Visible when those rows are served. Local public app historically pointed at Production. | **Cannot verify live DB** (no authorized SQL). Catalogue on `:8080` showed **0 quizzes** / creator filter empty during this pass. Prepared UPDATE exists; **not applied**. |
| Admin login placeholder `you@geoverze.com` (`LoginPage.tsx`) | Visible on admin sign-in. | Code-confirmed. Admin UI **unverified** (server not running). |
| Public profile fallback `explorer@geoverze.com` (`useProfile.ts`) | Can appear in profile chrome. | Code-confirmed; signed-in profile **unverified**. |
| Public contact `hello@geoverze.com` (`contact.ts`) | Customer-facing mailbox. | Code-confirmed. Also Class 5 (DNS/mailbox). |
| Printed wordmarks on **archived** public store folders (`public/assets/store/Hoodies/geoverze typo/*`, `doodle/*`) | Not imported by current store wiring. | Class 1 if shipped; currently unused (also Class 4). |
| Generated merch JPGs | Wired PDPs use `hoodie-gvrze-*` / `tshirt-gvrze-*`. Hoodie typo PDP heading **GVRZE**; lookbook lettering is GVRZE (OCR of the custom type can misread glyphs). | **Verified** on `/geostore/product/hoodie-geoverze-typo`. Product **id** `hoodie-geoverze-typo` is a technical slug (Class 2). |

No `GEOverze` / `GEOVERZE` / `Geoverze` string remains in **admin `src`**. Public `src` customer copy no longer uses those tokens except **identifiers** listed in Class 2.

### Class 2 — Approved legacy technical identifiers

| Item | Why retained |
|------|----------------|
| Routes `/geolibrary`, `/geostore`; product id `hoodie-geoverze-typo` and related SKU slugs | URL / catalogue compatibility. |
| Folder and package paths `geoverze-main`, `geoverze-public-main`, `geoverze-admin`, `geoverze-continuation-main` | Repo layout. |
| `site.domain` / canonicals `https://geoverze.com/...` | Live hostname until DNS cutover. |
| Persist dual-read: `geoverze.*`, `geoverze-admin-theme`, `geoVerze.quiz.lastResult` | Required until cleanup release. |
| DOM id `geoverze-universe-background` | CSS/JS hook. |
| Component names `WhyGeoverze`, `WhyGeoverzeIntro`, `WhyGeoverzeCarousel` | Identifiers only; on-page heading is **Why GVRZE**. |
| Quiz id `q-geoverze-cms-test-quiz` | Stable CMS id. |
| Applied seed SQL (`GEOverze Studio`, article SEO `— GEOlibrary`) | Do not rewrite applied migrations. |
| CSS comments (`GEOverze design tokens`, `GEOlibrary` / `GEOstore` hero comments) | Non-rendered. |
| Admin mock emails `*@geoverze.io`, webhook placeholder `https://example.com/geoverze/webhook` | Internal mocks / examples. |
| Supabase auth keys `sb-*` | Untouched. |

### Class 3 — Historical / legal material requiring review

| Item | Notes |
|------|--------|
| Terms: “owned by GVRZE” | Display-name swap only. **Verified** on `/terms`. Counsel should confirm legal entity vs trade name. |
| Privacy / terms copy already says GVRZE | Same review. |
| `docs/geoverze-prd.md`, `docs/geoverze-roadmap.md`, `docs/design-system.md` | Historical product docs still say GEOlibrary / GEOstore / GEOverze. |
| Admin `README.md` still titled GEOverze Control Center | Internal historical. |
| `.lovable/plan/*` historical plans | Archive. |

### Class 4 — Unused archived assets

| Asset | Notes |
|-------|--------|
| `src/assets/geostore/hoodie-geoverze-typo-*.png`, `hoodie-doodle-*.png`, `hoodie-know-earth-think-global.jpg`, original tees | Kept beside new `gvrze-*` files. |
| `public/assets/store/Hoodies/geoverze typo/*`, `doodle/*` | Duplicate public copies, not imported. Old printed wordmarks. |
| `public/assets/rewards/geoverze-merchandise.jpg`, `geostore.jpg` | Replaced in wiring by `gvrze-merchandise.jpg`, `gvrze-geostore.jpg`. |
| `geoverze-rewards-card-content.png`, `geoverze-rewards-card-source.jpg` | Unused / design source. |
| `src/assets/geoverze-emblem.png` | Replaced in BrandMark by `gvrze-emblem.png`. |

### Class 5 — External settings requiring manual updates

| Surface | Action |
|---------|--------|
| GitHub repo `GEOverze-` | Rename optional; not a code change. |
| Lovable project names / published URLs | Dashboard. |
| Supabase project display names (Production `hcxifkgzugxqijttmpzc`, staging `cjfmkuzhxqrulgrkfmqk`) | Dashboard only. |
| Auth email templates, SMTP from-name | Supabase Auth. |
| DNS / SSL stay on `geoverze.com` until cutover | Do not change `site.url` until DNS is ready. |
| App Store / Play / Stripe / analytics / OAuth brand names | Console updates. |
| `hello@geoverze.com` mailbox and MX | Ops. |

---

## 3. CMS quiz-label status

**Cannot be verified against the live database.** No SQL was executed on production or staging.

Prepared file (additive, display-only, not applied):

`supabase/migrations/20261014140000_gvrze_quiz_display_labels.sql`

- `creator = 'GEOverze Studio'` → `'GVRZE Studio'` (ids unchanged).
- `id = 'q-geoverze-cms-test-quiz'` and `title = 'GEOverze CMS test quiz'` → `'Question Types Sampler'`.

**Title accuracy (from Phase 2B content review, not re-queried):** six mixed-type items (typed capital of France; boolean continents; Japan; Machu Picchu; map pin Gibraltar; country→continent drag-drop). **Question Types Sampler** describes that set. Do not rename Flag Blitz / Atlas Sprint titles.

**Browser this pass:** Let's Play catalogue **“0 quizzes match”**; creator filter only “Any creator”. Therefore live titles were **not seen**. Phase 2B recorded Production as still carrying the old CMS title; that may still be true until the UPDATE or a CMS edit.

Applied seed `20260815140000_phase3a_quiz_seed.sql` still contains `'GEOverze Studio'` — left intact by design.

---

## 4. Persistence migration

**Implementation (reviewed):** `src/lib/persist-key-migration.ts` plus cart, bookmarks, preferences, profile, onboarding, community, studio, library scoped keys, store scoped + unscoped lift, notifications, quiz `sessionStorage` last result, admin `use-theme.tsx`.

Rules:

1. Prefer a parseable `gvrze.*` (or `gvrze-admin-theme`) value.
2. Copy usable legacy only when the new key is **absent**.
3. Writes hit only the new key. Legacy keys are never deleted.
4. Storage throws are caught.
5. `sb-*` keys are not remapped (`toGvrzePersistKey` leaves them unchanged).

**Malformed-primary limitation (Phase 2D) and 3A fix:** an occupied but unparseable new key no longer falls through to legacy. `isOccupiedPersistSlot` + `isParseablePersistedJson` return `null` without `setItem` of legacy onto the corrupt primary. Test: “does not copy legacy over a malformed primary key”. **Safe:** stale legacy cannot overwrite a newer/corrupt `gvrze.*` slot. Trade-off: that session hydrates empty until the corrupt key is cleared or rewritten by a later valid write.

**`npm run test:persist`:** **10/10 pass** (mapping, prefer-new, migrate-if-absent, empty/`null` legacy, throwing storage, malformed primary, idempotent second read, write-new-only / remove leaves legacy, `sb-*` unmapped, usable-value helper).

Store `version` fields (cart v2, preferences v3 + migrate) were not changed.

**Browser persist:** cart badge went **4 → 5** after Add to cart on the hoodie PDP (existing session data survived). Full bookmark/onboarding/profile/admin-theme click-through **not fully re-run**. Admin theme **unverified** (admin not served).

---

## 5. Browser regression

Public app was exercised on **existing** `http://localhost:8080`. Admin `http://localhost:8081` returned `chrome-error://` (nothing listening). **No competing servers were started.**

### Public — verified

| Area | Result |
|------|--------|
| Home + nav | Title **GVRZE — Discover Earth Like Never Before**. Nav: Home, Let's Play, **GVRZE Library**, **GVRZE Store**. Footer © 2026 GVRZE. Why GVRZE. Exclusive GVRZE Merchandise. |
| Let's Play | Title **Let's Play — GVRZE**. Practice / Daily / Weekly / Tournament CTAs **Coming soon** (disabled). Leaderboard button disabled. |
| Daily lock | `/play/daily-challenges` — “Daily challenges Coming soon”, “Daily challenges are locked”. |
| Weekly lock | `/play/weekly-challenges` — “Weekly challenges Coming soon”, “Weekly challenges are locked”. |
| Leaderboard lock | `/play/leaderboard` — “Standings are locked”. Footer “Leaderboard Soon”. |
| Rewards redirect | `/play/rewards` → `/quiz-history-and-rewards?tab=rewards`. Auth gate: “Sign in to continue” / “This area belongs to your GVRZE account.” |
| Store PDP | `/geostore/product/hoodie-geoverze-typo` — **Product — GVRZE Store \| GVRZE**, heading GVRZE, colour White→Pink, size M, Add to cart (count 4→5). |
| Library index | Title **GVRZE Library — Explore the world beyond quizzes** (prior 3A snapshot). |
| Article | `/geolibrary/article/why-some-countries-have-two-capitals` — body loaded; chrome **GVRZE Library · Capitals & cities**. No GEOlibrary in visible chrome. |
| Sign-in | `/auth/login` — **Sign in to GVRZE**. Placeholder `you@example.com`. Session persistence **unverified** (no credentials used). |
| Terms | “owned by GVRZE”; page branded GVRZE. |

### Public — unverified

- Signed-in dashboard Credits and Profile → Rewards **tab UI** (auth-gated).
- Completing a quiz / session-scoped last-result migrate in the browser.
- Mobile and tablet viewports (desktop only this pass).
- Admin app (see below).
- Live quiz cards / CMS titles (empty catalogue).

### Admin — unverified

`:8081` was **not running**. Login, GVRZE Admin chrome, theme persistence, library/store/quiz/credit screens were **not** exercised. Code titles in admin routes already say **GVRZE Admin**.

---

## 6. Build / lint / type-check

| Check | Result |
|-------|--------|
| `npm run test:persist` | **Pass 10/10**. |
| ESLint persist helper + test (after malformed-key edit) | **Pass** (`--max-warnings 0`). |
| ESLint admin `use-theme.tsx` | **Pass** (Phase 2D). |
| ESLint merch files | Earlier Phase 2C prettier wrap failures were fixed in later 2C work; not re-run as a full-app lint. |
| Full `eslint .` / `tsc` / `vite build` (public and admin) | **Not re-run this pass.** Prior phases treated full tsc/Vite production failures as **pre-existing**. Do not “fix” unrelated errors to hide that. |

---

## 7. Remaining asset and legal tasks

- Counsel review of “owned by GVRZE” vs registered entity.
- Optional later replacement of archived merch PNGs / public Hoodies folders.
- Optional later persist cleanup release (`removeItem` on `geoverze.*` after adoption).
- Studio SEO previously had duplicate **“GVRZE GVRZE Library”** in article list/new meta (post-3A scoped fix; titles/canonicals unchanged).
- Apply quiz display SQL only after explicit authorization and confirmed environment.

---

## 8. External services still needing manual action

See Class 5. Highest impact: Auth email templates, Supabase project labels, contact mailbox, GitHub/Lovable names, payment/OAuth brand strings. **Do not** change route prefixes or `site.url` until DNS is planned.

---

## 9. Proposed safe commit plan (do not execute yet)

Separate **rebrand** from **locks/rewards** and from **unrelated WIP**. Suggested order after the user asks to commit:

1. **Locks + Rewards only** — Daily/Weekly/Practice/Tournament coming-soon, Leaderboard lock, `/play/rewards` redirect. Exclude merch binaries and persist files.
2. **Phase 2A/2B copy + emblem** — `site.ts`, BrandMark, legal, admin titles. Exclude quiz SQL until you intend to ship the file (applying it is a separate ops step).
3. **Phase 2C assets + merch wiring** — new `gvrze-*` images and import updates only. Leave unused originals untracked or in a later archive commit if desired.
4. **Phase 2D persist** — `persist-key-migration.ts`, `.test.ts`, store/persistence/theme/quiz-result edits, `package.json` `test:persist`.
5. **Quiz SQL file only** — add `20261014140000_gvrze_quiz_display_labels.sql` without applying it.
6. **Unrelated admin/library/quiz-builder** — own PR/commit after review; do not fold into rebrand.

Never commit `.env`, `.env.local`, or keys.

---

## 10. Disk / follow-up note (post-3A)

`GVRZE_PHASE3A_FINAL_AUDIT.md` was created after a **0-byte** placeholder existed. C: had **~12.7 GB free** at write time (not a full-disk failure).

**No commit or push was made.**
