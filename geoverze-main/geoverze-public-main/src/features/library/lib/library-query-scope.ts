import type { QueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/authStore";

import { LIBRARY_CATALOGUE_CACHE_VERSION } from "./library-catalogue";
import type { LibraryAccessTier } from "./access-tier";
import type { LibraryQuery } from "./filter";

/** React Query scope segment — isolates GEOlibrary cache per auth identity. */
export function libraryAuthScope(userId: string | null | undefined): string {
  return userId ?? "anon";
}

/** Catalogue query segment shared by list/browse/collection metadata caches. */
export function libraryCatalogueQueryScope(scope: string) {
  return [LIBRARY_CATALOGUE_CACHE_VERSION, scope] as const;
}

export function useLibraryAuthScope() {
  const userId = useAuthStore((s) => s.user?.id);
  const authReady = useAuthStore((s) => s.status !== "unknown");

  return {
    scope: libraryAuthScope(userId),
    authReady,
  };
}

let libraryQueryClient: QueryClient | null = null;
let lastRegisteredScope: string | null = null;
let lastRegisteredTier: LibraryAccessTier | null = null;

export function registerLibraryQueryClient(client: QueryClient) {
  libraryQueryClient = client;
}

/** Drop catalogue list caches after engagement counter changes. */
export function invalidateLibraryCatalogueQueries() {
  if (!libraryQueryClient) return;

  void libraryQueryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
  void libraryQueryClient.invalidateQueries({ queryKey: ["browseArticles"] });
  void libraryQueryClient.invalidateQueries({ queryKey: ["libraryRecommended"] });
}

/** Drop GEOlibrary caches when auth identity changes. */
export function invalidateLibraryQueries() {
  if (!libraryQueryClient) return;

  void libraryQueryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
  void libraryQueryClient.invalidateQueries({ queryKey: ["browseArticles"] });
  void libraryQueryClient.invalidateQueries({ queryKey: ["libraryRecommended"] });
  void libraryQueryClient.invalidateQueries({ queryKey: ["libraryArticle"] });
  void libraryQueryClient.invalidateQueries({ queryKey: ["librarySubscriptionTier"] });
  void libraryQueryClient.invalidateQueries({ queryKey: ["publishedCollections"] });
  void libraryQueryClient.invalidateQueries({ queryKey: ["publishedCreators"] });
}

/** Drop article caches when effective subscription tier changes. */
export function invalidateLibraryArticleQueries() {
  if (!libraryQueryClient) return;
  void libraryQueryClient.invalidateQueries({ queryKey: ["libraryArticle"] });
}

export function syncLibraryQueryScope(nextScope: string) {
  if (lastRegisteredScope !== null && lastRegisteredScope !== nextScope) {
    invalidateLibraryQueries();
    lastRegisteredTier = null;
  }
  lastRegisteredScope = nextScope;
}

export function syncLibrarySubscriptionTier(nextTier: LibraryAccessTier) {
  if (lastRegisteredTier !== null && lastRegisteredTier !== nextTier) {
    invalidateLibraryArticleQueries();
  }
  lastRegisteredTier = nextTier;
}

export function resetLibrarySubscriptionTierTracking() {
  lastRegisteredTier = null;
}

export const librarySubscriptionTierQueryKey = (scope: string) =>
  ["librarySubscriptionTier", scope] as const;

export const articleBySlugQueryKey = (slug: string, scope: string, accessTier: LibraryAccessTier) =>
  ["libraryArticle", slug, scope, accessTier] as const;

export const publishedArticlesQueryKey = (scope: string) =>
  ["publishedArticles", ...libraryCatalogueQueryScope(scope)] as const;

export const browseArticlesQueryKey = (query: LibraryQuery, scope: string) =>
  ["browseArticles", ...libraryCatalogueQueryScope(scope), query] as const;

export const publishedCollectionsQueryKey = (scope: string) =>
  ["publishedCollections", ...libraryCatalogueQueryScope(scope)] as const;

export const publishedCreatorsQueryKey = (scope: string) => ["publishedCreators", scope] as const;
