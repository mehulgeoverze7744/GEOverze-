# Phase 5 — GEOlibrary & GEOstore Management

Both `/library` and `/store` are currently thin `ResourcePage` placeholders over `src/lib/mock-data`. This phase turns them into full modules following the exact pattern already proven in `src/features/creators`, `quizzes` and `questions` (types → seeded data → filtering → columns → stats → filters → actions hook → routes). No redesign, no changes to completed modules, sidebar labels preserved.

## Section A — GEOlibrary

New module `src/features/library/`:
- `types.ts` — `LibraryResource` with title, slug, category (Article, Country Profile, Continent Collection, Map, Infographic, PDF, Educational Resource), country, region, difficulty, tags, language, author, status (draft/pending/published/archived), featured, views, bookmarks, createdAt, updatedAt, plus `ResourceVersion` and SEO/media sub-objects.
- `data.ts` — ~120 deterministic seeded resources across all categories, with summary stats, category distribution and views-over-time series.
- `filtering.ts`, `columns.tsx` (with `StatusBadge`, `DifficultyBadge`, featured star, formatted counts), `library-stats.tsx`, `library-filters.tsx` (category, status, region, difficulty, language, featured).
- `use-library-actions.ts` — publish / archive / delete / feature toggle, bulk variants, `ConfirmDialog` state, toasts.
- `resource-editor.tsx` — drawer/step editor: details, rich-text body (textarea-based composer with formatting toolbar), cover image + gallery + attachment placeholders, SEO fields (meta title, description, canonical, OG), tags input, live preview, publish controls.

Routes:
- `library.tsx` → layout with `<Outlet />`.
- `library.index.tsx` → directory: stat grid, charts, search + filters, sortable paginated `DataTable`, bulk publish/archive/delete, featured content strip.
- `library.new.tsx` → resource editor.
- `library.$resourceId.tsx` → detail: Overview, Content, Media, SEO, Analytics, Version History (UI), Activity tabs.

## Section B — GEOstore

New module `src/features/store/`:
- `types.ts` — `StoreProduct` (physical, digital, reward, credit-redemption, gift card) with SKU, category, collection, price/compare-at, discount, stock + stock status, variants, images, featured, availability, shipping placeholder; plus `StoreOrder`, `OrderEvent`, `Coupon`, `RedemptionItem`.
- `data.ts` — ~80 products, ~140 orders with timelines, ~24 coupons, ~20 redemption catalog items, all seeded/deterministic; summary + revenue/top-product series.
- `filtering.ts`, `columns.tsx` (products, orders, coupons, redemptions), `store-stats.tsx`, filter components.
- `use-store-actions.ts`, `use-order-actions.ts`, `use-coupon-actions.ts` — bulk feature/archive/delete, order status transitions, refund/shipping/invoice placeholders via the shared `notReady` toast, coupon create/edit/delete/activate/deactivate.
- `product-editor.tsx` and `coupon-editor.tsx` — drawer forms with validation.

Routes (sidebar entry stays `GEOstore` → `/store`; sub-areas are child routes reachable from in-page tabs and rows):
- `store.tsx` layout, `store.index.tsx` (products directory + collections/categories + inventory view + export UI)
- `store.orders.tsx` (orders table) and `store.orders.$orderId.tsx` (details, timeline, status management, customer, refund/shipping/invoice placeholders)
- `store.coupons.tsx`, `store.redemptions.tsx`
- `store.$productId.tsx` (product detail: overview, variants, inventory, pricing, analytics)

## Analytics

A commerce/content KPI band reused across `/library` and `/store` index pages: Total Resources, Published, Drafts, Total Products, Orders, Revenue (mock), plus Top Products, Top Articles and Popular Categories widgets built with existing `StatGrid`, `StatCard`, `ChartCard`, `Widget`.

## Technical notes

- Every UI element comes from the existing shared library (`DataTable`, `FilterBar`, `SearchBar`, `ActionToolbar`, `ConfirmDialog`, `SideDrawer`, `InspectorPanel`, `StatGrid`, `PageBody`, `ChartCard`, `StatusBadge`, `DifficultyBadge`, `EmptyState`, skeleton states, sonner toasts).
- Shared taxonomy (countries, regions, languages, categories) added to `src/lib/catalog.ts` rather than duplicated.
- Data access stays behind pure module functions so a backend can replace `data.ts` without touching components.
- `src/lib/mock-data.ts` `articles`/`orders` stay untouched (still used by the dashboard); the new modules own their own data.
- Each route gets its own `head()` metadata; layouts render `<Outlet />` only.
- Verification: typecheck + eslint, then a browser pass over `/library`, `/library/new`, `/library/:id`, `/store`, `/store/orders`, `/store/orders/:id`, `/store/coupons`, `/store/redemptions` at desktop and mobile widths.
