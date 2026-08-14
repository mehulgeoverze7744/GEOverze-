/**
 * The single data seam.
 *
 * Every feature reads placeholder records through these helpers instead of
 * importing data modules straight into components. When Supabase lands, only
 * the bodies here (and the per-feature fetchers that call them) change — no
 * screen, hook or component needs editing.
 */

/** Latency simulation so loading states are real before a backend exists. */
export const PLACEHOLDER_LATENCY = 420;

export function resolveWith<T>(data: T, latency = PLACEHOLDER_LATENCY): Promise<T> {
  if (latency <= 0) return Promise.resolve(data);
  return new Promise((resolve) => setTimeout(() => resolve(data), latency));
}

export function rejectWith(message: string, latency = PLACEHOLDER_LATENCY): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), latency));
}

/** Shape every list fetcher returns, so pagination can arrive without churn. */
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export function toPage<T>(items: readonly T[], page = 1, pageSize = items.length): Page<T> {
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    total: items.length,
    page,
    pageSize,
    hasMore: start + slice.length < items.length,
  };
}

/**
 * Query key registry. Keeping keys in one place means cache invalidation after
 * a real mutation is a one-line change per feature.
 */
export const queryKeys = {
  play: {
    quizzes: (filters?: unknown) => ["play", "quizzes", filters ?? null] as const,
    collections: () => ["play", "collections"] as const,
    history: () => ["play", "history"] as const,
    leaderboard: (scope: string) => ["play", "leaderboard", scope] as const,
  },
  library: {
    articles: (filters?: unknown) => ["library", "articles", filters ?? null] as const,
    article: (slug: string) => ["library", "article", slug] as const,
  },
  store: {
    catalogue: (filters?: unknown) => ["store", "catalogue", filters ?? null] as const,
    orders: () => ["store", "orders"] as const,
  },
  community: {
    feed: (topic?: string) => ["community", "feed", topic ?? "all"] as const,
    members: () => ["community", "members"] as const,
  },
  studio: {
    quizzes: () => ["studio", "quizzes"] as const,
    analytics: () => ["studio", "analytics"] as const,
  },
  profile: {
    me: () => ["profile", "me"] as const,
    progression: () => ["profile", "progression"] as const,
  },
  search: {
    global: (query: string) => ["search", "global", query] as const,
  },
} as const;
