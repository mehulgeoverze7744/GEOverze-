# Phase 3 — Creator Management

Build out Creators into a full module that mirrors the existing User Management pattern (feature folder + rich table + detail views), reusing every shared component. No redesign, no changes to other modules, mock data only.

## What exists today
- `/creators` is a thin `ResourcePage` over a 46-row `creators` array in `src/lib/mock-data.ts` with 8 columns and an inspector panel.
- User Management already has the enterprise pattern to copy: `src/features/users/` (types, deterministic mock data, columns, filtering, stats, detail drawer) driving `src/routes/users.tsx`.
- Shared library available: PageHeader, DataTable (search, sort, filters, pagination, bulk select, column toggle, export, skeletons, empty state, mobile cards), ActionToolbar, ConfirmDialog, SideDrawer, InspectorPanel, StatCard, ChartCard, Widget, ActivityTimeline, StatusBadge, EmptyState, ErrorState, Highlight.

## What is incomplete
No creator fields for avatar, email, country, verification state, plays, quiz ownership, achievements, warnings, verification timeline or notes; no creator profile page; no verification workflow, actions or analytics cards.

## Changes

### 1. Creator feature module (`src/features/creators/`)
- `types.ts` — `CreatorRecord` (avatar, displayName, username, email, country, tier, verification: Pending/Verified/Rejected/Suspended, status, totalQuizzes, followers, totalPlays, revenue, joinDate, rating), plus `CreatorQuiz`, `CreatorActivity`, `CreatorWarning`, `CreatorNote`, `VerificationEvent`, `CreatorFilterState`.
- `data.ts` — deterministic seeded mock generator (same `rng`/`isoDaysAgo` approach as users) producing ~48 creators with owned quizzes (play count, avg score, completion rate, status), activity, achievements, warnings, verification timeline and notes. Written as a mock service layer (`getCreators()`, `getCreatorById()`) so a Supabase call can replace the body later.
- `filtering.ts` — query + multi-filter reducer, same shape as user filtering.
- `columns.tsx` — `CreatorAvatar`, `TierBadge`, `VerificationBadge` and `buildCreatorColumns(query)` covering all 13 requested columns, with less-critical ones `defaultHidden`.
- `creator-stats.tsx` — 8 StatCards (total, verified, pending, active, inactive, published quizzes, average rating, monthly growth) + ChartCards for growth and tier mix using existing chart style.
- `creator-filters.tsx` — tier / verification / status / country filters via existing FilterBar.
- `use-creator-actions.ts` — hook owning confirm-dialog state and the View/Edit/Verify/Reject/Suspend/Reactivate/Delete flows with success toasts.
- `creator-detail-drawer.tsx` — SideDrawer with tabs (Overview, Quizzes, Activity, Revenue, Verification, Notes) for quick inspection from the table.

### 2. Routes
- `src/routes/creators.tsx` → layout route rendering `<Outlet />`.
- `src/routes/creators.index.tsx` → directory: PageHeader, analytics cards, filters, DataTable with bulk select + ActionToolbar bulk actions, export button, row actions, refresh with skeleton loading, empty/error states, responsive mobile cards. Row click navigates to the profile.
- `src/routes/creators.$creatorId.tsx` → profile page: breadcrumbs, header with avatar/badges/action buttons, Overview + Personal Information, Creator Statistics, Performance charts, Revenue summary, Published/Draft quiz tables (opening quiz detail in a drawer), Recent Activity timeline, Achievements, Warnings, Verification timeline, Notes. Unknown id renders the shared not-found/error state.
- Each route gets its own `head()` metadata.

### 3. Quality
- Strict TypeScript, no duplicated components, keyboard-accessible rows/dialogs, mock-service boundary kept clean for future Cloud integration.

## Technical notes
- Existing `Creator` type in `src/types/index.ts` stays untouched; the new richer record lives in the feature folder so no other module changes.
- `StatusBadge` gains no edits — verification tones reuse existing `pending`/`active`/`suspended` keys plus a local `VerificationBadge` for "verified"/"rejected".
- Verification and destructive actions all route through `ConfirmDialog` before firing a toast.
