# Phase 4 — Quiz Management & Question Bank

Build the quiz and question modules to the same depth as Creator Management, reusing the existing shared component library (DataTable, ActionToolbar, FilterBar, ChartCard, StatGrid, SideDrawer, ConfirmDialog, StatusBadge, PageHeader/PageBody). No redesign, no changes to other modules, mock data only.

## What exists today
- `/quizzes` and `/questions` are thin `ResourcePage` stubs over `src/lib/mock-data` with a handful of columns and an inspector panel.
- `src/features/creators/` establishes the module pattern: `types.ts`, seeded `data.ts`, `filtering.ts`, `columns.tsx`, stats, filters, an actions hook, a detail drawer, plus a directory route and a `$id` profile route. Phase 4 follows the same shape.

## What gets built

### Quiz module (`src/features/quizzes/`)
- Types for a quiz record: title, creator, category, difficulty, question count, estimated duration, status (draft/published/archived), visibility, language, tags, thumbnail, time limit, passing score, instructions, created/updated dates, plays, rating, version history, activity, difficulty distribution, monthly play series.
- Deterministic seeded mock dataset (~60 quizzes) using creator names from the existing creator data so the two modules stay consistent.
- Directory table with all 13 requested columns, global search, multi-filter (status, category, difficulty, visibility, language, creator), sort, pagination, bulk selection.
- Bulk publish / archive / delete behind confirmation dialogs, duplicate quiz, export placeholder toast.
- Stats row and charts: totals by status, total questions, average difficulty, most played, highest rated, plays-over-time and difficulty-distribution charts.

### Quiz detail (`/quizzes/$quizId`)
Tabbed profile page: Overview (quiz information, creator information, question statistics, play statistics), performance and difficulty-distribution charts, recent activity timeline, and version history. A quick-view drawer from the directory mirrors the creator drawer.

### Quiz builder (`/quizzes/new`)
Multi-step form: General information → Settings (category, difficulty, tags, language, visibility, time limit, passing score, thumbnail placeholder, instructions) → Questions (pick from the question bank) → Preview → Publish. Per-step validation, an "auto-saved" indicator (UI only), and a toast on publish.

### Question bank (`src/features/questions/`, `/questions`)
- Types covering multiple choice, true/false, fill in the blank, image based, map based, plus matching and ordering marked backend-ready.
- Each question carries difficulty, category, region, country, topic, tags, language, explanation, correct answer, media placeholder, usage count, and status.
- Directory table with search, filters (type, difficulty, status, region, language, topic), sort, pagination, bulk actions.
- Create/edit dialog with per-type answer editors; duplicate, delete, archive, restore, preview; import and export placeholders.
- Validation surface: missing answer, duplicate options, missing media, incomplete explanation, empty question text, invalid difficulty — shown inline in the editor and as a validation badge in the table.

### Quiz preview
Interactive player-style preview (question navigation, option selection, reveal answer plus explanation, progress) reachable from the builder, the quiz detail page, and question preview.

### Enterprise UX
Loading skeletons on tables, stats and charts; empty and error states; confirmation dialogs for destructive actions; toasts; responsive mobile cards; keyboard-accessible controls.

## Technical notes
- New route files: `quizzes.tsx` (layout with `<Outlet />`), `quizzes.index.tsx`, `quizzes.new.tsx`, `quizzes.$quizId.tsx`; `questions.tsx` rewritten as a full directory route.
- Existing `Quiz` / `Question` types in `src/types/index.ts` stay untouched; the richer records live in the feature modules so unrelated pages keep working.
- All mutations go through `use-quiz-actions.ts` and `use-question-actions.ts` hooks holding local state, so swapping in a backend is a single-layer change.
- Strict TypeScript, seeded RNG for SSR-stable data, per-route `head()` metadata.
- Verify with typecheck, lint, and a browser pass over each new route.