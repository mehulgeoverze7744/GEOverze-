/** Read-only catalogue projection — published metadata only, no blocks. */
export const LIBRARY_CATALOGUE = "library_catalogue_resources" as const;

/** Busts pre–Option B React Query catalogue caches keyed without this marker. */
export const LIBRARY_CATALOGUE_CACHE_VERSION = "catalogue-v3" as const;
