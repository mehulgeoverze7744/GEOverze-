# Phase 7 — Operations Center

Turn the four thin pages (`/analytics`, `/settings`, `/audit-logs`, `/notifications`) into a full Operations Center, plus a new Monitoring page. Same design system, same shared components, mock data only.

## What gets built

**Analytics (`/analytics`)** becomes a layout with two views:
- Executive overview — KPI band covering users, creators, quizzes, questions, library, store, orders, revenue, subscriptions, credits, rewards and community reports, each with a trend indicator; charts for growth, revenue and engagement; a date-range selector (7/30/90 days, custom) and an Export button (placeholder toast).
- Business intelligence (`/analytics/intelligence`) — reporting views for user & creator growth, quiz performance, question stats, revenue, country-wise usage, top categories, most-played quizzes, store performance, library engagement, retention and monthly activity. Filters: date, region, creator, category, subscription.

**Audit logs (`/audit-logs`)** — richer mock event stream across user, creator, quiz, question, store, reward, admin, permission and settings changes; search, category/actor/result/date filters, a timeline view alongside the table, detail inspector, export placeholder.

**Notification center (`/notifications`)** — keeps the existing inbox and adds management tabs: compose/schedule an announcement, templates library, scheduled queue, and delivery history, with badges for alert/warning/success/announcement types.

**Monitoring (`/monitoring`, new page)** — system health cards, storage usage bars, active sessions table, performance cards (latency, uptime, error rate), plus clearly-labelled placeholders for database, API and error logs.

**System settings (`/settings`)** becomes a layout with grouped sections: General, Branding, Platform, Quiz rules, Reward rules, Credit rules, Subscriptions, Community, Security, Integrations (email/storage/API placeholders), Maintenance mode and Feature flags. Save actions use the existing local-save toast pattern.

## Navigation

Analytics group: Overview, Business Intelligence, Audit Logs.
Platform group: Notifications, Monitoring, System Settings.
No existing URL is removed; `/analytics`, `/settings`, `/audit-logs`, `/notifications` all keep working.

## Technical notes

- New feature module `src/features/ops/` holding `types.ts`, `data.ts` (deterministic seeded mock generators following the existing `catalog.ts` rng pattern), `filtering.ts` and `columns.tsx` for audit events, notifications, templates, sessions and BI report rows.
- Settings state lives in one `use-settings.ts` hook with a typed settings object — a single swap point for a future backend call.
- Reuses `PageHeader`, `PageBody`, `StatGrid`, `StatCard`, `ChartCard`, `DataTable`, `FilterBar`, `SearchBar`, `ActionToolbar`, `SideDrawer`/`InspectorPanel`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `StatusBadge`, `ActivityTimeline` and `notReady` for placeholder actions. No new UI primitives.
- Route files follow the existing layout + `*.index.tsx` convention with per-route `head()` metadata.
- Completed modules (users, creators, quizzes, questions, library, store, moderation, rewards, credits, subscriptions) are not touched, apart from reading their mock data for dashboard aggregates.
- Verified with `tsgo`, ESLint, and a browser pass over each new route.