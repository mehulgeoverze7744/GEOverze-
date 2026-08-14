# Restore and run the uploaded Geoverze project

The upload is a complete, self-contained TanStack Start app (same stack as this workspace: React 19, Vite, Tailwind v4, TanStack Router/Query, three.js + react-three-fiber, GSAP, Zustand). It is frontend-only — no backend integration, no `.env` file, and no Supabase folder. No new project or rewrite is needed.

## What's in the archive

- ~115 route files under `src/routes/` (marketing, auth, play/quiz, community, geolibrary, geostore, studio, pricing, account area)
- Feature modules under `src/features/` with local mock/seed data
- Shared UI in `src/components/`, stores in `src/stores/`, assets (globe/emblem images), docs
- Full config: `vite.config.ts`, `package.json`, `bun.lock`, `tsconfig`, `eslint`, `components.json`
- No `.git` metadata in the archive

## Steps

1. Extract the archive to a temp folder and copy its contents over the workspace, excluding any git metadata and `node_modules`. Existing template placeholders (`src/routes/index.tsx`, `__root.tsx`, `styles.css`) are replaced by the uploaded versions — this is a restore, not a rewrite.
2. Install dependencies with bun using the shipped lockfile.
3. Start the app with the project's own dev command (`vite dev`, the existing `dev` script) — the dev server is already supervised on port 8080.
4. Check the running app: load the home page, watch console/build output, and click through a few representative routes (play, community, an account-gated page).
5. Fix only what blocks startup — for example a duplicate `/` route claimant, a missing package that isn't in `package.json`, or an SSR-time browser-only import from the three.js globe. No feature, design, or copy changes.

## Environment variables

None found in the uploaded code — no `.env`, no `.env.example`, no Supabase or API-key usage. If the run surfaces a required variable, I'll list the names and leave them unset rather than guessing values.

## Risks to watch

- The 3D globe (`react-three-fiber` / `three`) runs during SSR; if it throws, the minimal fix is deferring that component to the client.
- Any route file whose imports don't resolve will fail the build; those get resolved by creating nothing new — only by correcting the import path if the file was renamed in the archive.
