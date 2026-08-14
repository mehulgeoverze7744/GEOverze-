/**
 * Handle to the shared starfield layer element, set by UniverseBackground.
 *
 * Scroll-driven scenes animate it imperatively — no React state, no re-renders.
 */
export const skyLayer: { current: HTMLDivElement | null } = { current: null };
