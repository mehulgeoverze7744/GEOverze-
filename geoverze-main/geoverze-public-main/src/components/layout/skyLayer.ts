/**
 * Handle to the shared page-backdrop layer, set by UniverseBackground.
 *
 * Scroll-driven scenes animate it imperatively — no React state, no re-renders.
 */
export const skyLayer: { current: HTMLDivElement | null } = { current: null };
