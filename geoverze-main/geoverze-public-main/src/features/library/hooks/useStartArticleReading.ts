import { useEffect } from "react";

import { useLibraryStore } from "@/stores/libraryStore";

/** Clears Continue Reading dismiss when the user opens an article (progress starts on scroll). */
export function useStartArticleReading(slug: string, enabled: boolean) {
  const startReading = useLibraryStore((s) => s.startReading);

  useEffect(() => {
    if (!enabled || !slug) return;
    startReading(slug);
  }, [enabled, slug, startReading]);
}
