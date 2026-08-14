# Phase 6 — Community, Rewards, Credits & Subscriptions

Four new feature modules built on the existing shared components (DataTable, SideDrawer, ConfirmDialog, StatGrid, ChartCard, StatusBadge, ActionToolbar, FilterBar, EmptyState). No redesign, no changes to Users, Creators, Quizzes, Questions, Library or Store.

## 1. Community Moderation (`/moderation`)

Becomes a layout route with four sub-tabs, matching the `/store` segmented-nav pattern:

- `/moderation` — User reports
- `/moderation/quizzes` — Quiz reports
- `/moderation/creators` — Creator reports
- `/moderation/community` — Community reports (posts, comments, chat)

Every queue shares one table shape: case ID, target, reporter, reported user, reason, priority, status, evidence placeholder, reported date, assignee, actions. Search, plus filters for priority, status, reason and date range. Bulk selection for batch resolve.

A case drawer opens on row click with tabs for Overview, Evidence (placeholder media/text cards), History (moderation timeline) and Appeal (placeholder panel). Actions available from the drawer and toolbar: Approve, Reject, Warn, Suspend, Ban, Restore, Escalate. Destructive actions (suspend, ban, escalate) require a confirmation dialog with an optional reason note; each action appends an entry to the case timeline and fires a toast.

`/reports` stays as-is.

## 2. Reward Management (`/rewards`)

Replaces the current static placeholder page with a full directory while keeping the page title and description.

- Reward types: Credits, Digital, Store, Achievement, Special Event
- Fields: name, description, type, eligibility rule, credits required, availability window, stock, status (draft/active/paused/archived), expiry, claims
- Reward editor drawer for create and edit, with validation
- Reward history tab: recent claims with user, reward, credits spent, timestamp
- Stat cards and a claims-over-time chart above the table

## 3. Credit Management (`/credits`)

New route added to the Commerce sidebar group, as a layout with four sub-tabs:

- `/credits` — Ledger: every transaction (user, type earn/spend/adjust/expire, amount, balance after, source, date), with filters and search
- `/credits/rules` — Monthly credit rules and reward rules: rule name, trigger, amount, cap, audience, status, with an editor drawer
- `/credits/adjustments` — Manual adjustment tool: single user grant/deduct with reason, plus bulk adjustment against a selected cohort, both behind a confirmation dialog showing total credits affected
- `/credits/analytics` — Issuance vs redemption charts, balance distribution, top earners/spenders, and monthly reset configuration (reset day, rollover cap, expiry policy)

## 4. Subscription Management (`/subscriptions`)

Layout with two sub-tabs:

- `/subscriptions` — Plans: Basic, Pro, Advanced as comparison cards plus a table of plan config (price monthly/yearly, features, permissions, benefits, credit allowance, upgrade availability, status). Plan editor drawer.
- `/subscriptions/subscribers` — Existing subscriber table (account, plan, status, seats, MRR, renewal placeholder), preserved and extended with a detail drawer showing billing timeline and plan history.
- Analytics band: MRR, ARPU, churn, plan-mix chart, revenue trend (all mock).

## 5. Dashboard Analytics

The existing `/` dashboard gains a Phase 6 stat band, reusing StatGrid: Active Subscribers, Credits Issued, Credits Redeemed, Pending Reports, Open Appeals, Revenue (mock), plus two compact widgets for Top Rewards and Most Reported Content. Existing dashboard content is untouched.

## Technical notes

- New feature folders: `src/features/moderation/`, `src/features/rewards/`, `src/features/credits/`, `src/features/subscriptions/`. Each follows the established shape: `types.ts`, `data.ts` (deterministic seeded mock generator), `filtering.ts`, `columns.tsx`, `*-stats.tsx`, `*-filters.tsx`, `use-*-actions.ts` hook, and editor/drawer components.
- Mock data volumes: ~180 moderation cases across four surfaces, ~40 rewards with claim history, ~600 credit ledger entries and ~14 credit rules, 3 plans and ~120 subscriber records.
- All mutations run through hooks holding local state so swapping in real API calls later is a one-file change per module.
- Sidebar: add `Credits` under Commerce and expand Moderation with the four queue entries in `src/lib/nav.ts`.
- Every new route gets its own `head()` metadata; layout routes render `<Outlet />`.
- Verification: `tsgo` typecheck, ESLint, and a Playwright pass over each new route checking headings and console errors.