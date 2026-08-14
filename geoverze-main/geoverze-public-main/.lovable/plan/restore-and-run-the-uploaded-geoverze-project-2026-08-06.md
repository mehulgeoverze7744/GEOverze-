# Restore and run the uploaded Geoverze project

The upload is a complete TanStack Start app (693 files) built on the same stack this workspace already uses — React 19, TanStack Router/Start, Tailwind v4, Vite, Three.js/react-three-fiber, GSAP, Zustand. Nothing needs rewriting; it just needs to be placed into the project and started.

## What I'll do

1. Extract the archive to a temp folder and confirm it contains no `.git` metadata.
2. Copy the app source over the current template: `src/` (routes, components, features, lib, assets, config), `public/`, `docs/`, and the root configs (`package.json`, `vite.config.ts`, `tsconfig.json`, `components.json`, `eslint.config.js`, `bunfig.toml`, `bun.lock`, `.prettierrc`, `.prettierignore`, `README.md`, `AGENTS.md`). The placeholder `src/routes/index.tsx` is replaced by the uploaded landing page.
3. Remove template-only leftovers that the uploaded code does not include, so no orphan route files remain in `src/routes/`.
4. Install dependencies with `bun install` (lockfile is included).
5. Let the dev server run the existing start command `vite dev` (already the project's `dev` script) and confirm the preview loads.
6. Fix only blocking issues if they appear — for example a route-tree regeneration mismatch, a missing dependency, or an SSR-time browser/WebGL access in the globe scene. No feature or design changes.

## Environment variables

The uploaded code has no Supabase integration, no `.env` file, and no `process.env` / `import.meta.env` secrets — all data comes from local placeholder modules behind `src/lib/data-source.ts`. So no environment variables are required. If anything surfaces during the run, I'll list the names rather than invent values.

## Verification

- Dev server responds on the preview URL.
- Home route renders the 3D globe landing page without console errors.
- Spot-check a few sub-routes (auth, community, geolibrary, dashboard) for clean SSR.
