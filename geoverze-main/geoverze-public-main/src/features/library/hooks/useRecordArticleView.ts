import { useEffect, useRef } from "react";

import { recordLibraryView } from "@/features/library/data/recordLibraryView";
import { patchCachedArticleMetrics } from "@/features/library/lib/library-query-scope";

const recordedResourceIds = new Set<string>();

/**
 * One authenticated view-record attempt per resource per browser session.
 * The server still dedupes the same user to one count per six hours.
 */
export function useRecordArticleView(
  resourceId: string | undefined,
  slug: string | undefined,
  enabled: boolean,
) {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !resourceId || attemptedRef.current || recordedResourceIds.has(resourceId)) {
      return;
    }

    attemptedRef.current = true;
    recordedResourceIds.add(resourceId);

    void recordLibraryView(resourceId)
      .then((result) => {
        if (!slug) return;
        patchCachedArticleMetrics(slug, { views: result.view_count });
      })
      .catch((error) => {
        recordedResourceIds.delete(resourceId);
        attemptedRef.current = false;
        console.error("Failed to record GVRZE Library article view", error);
      });
  }, [enabled, resourceId, slug]);
}
