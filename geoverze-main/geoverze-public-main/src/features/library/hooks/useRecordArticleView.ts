import { useEffect, useRef } from "react";

import { recordLibraryView } from "@/features/library/data/recordLibraryView";
import { invalidateLibraryCatalogueQueries } from "@/features/library/lib/library-query-scope";

const recordedResourceIds = new Set<string>();

/** One in-memory view record attempt per resource per active session. */
export function useRecordArticleView(resourceId: string | undefined, enabled: boolean) {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !resourceId || attemptedRef.current || recordedResourceIds.has(resourceId)) {
      return;
    }

    attemptedRef.current = true;
    recordedResourceIds.add(resourceId);

    void recordLibraryView(resourceId)
      .then((result) => {
        if (result.counted) {
          invalidateLibraryCatalogueQueries();
        }
      })
      .catch((error) => {
        recordedResourceIds.delete(resourceId);
        attemptedRef.current = false;
        console.error("Failed to record GEOlibrary article view", error);
      });
  }, [enabled, resourceId]);
}
