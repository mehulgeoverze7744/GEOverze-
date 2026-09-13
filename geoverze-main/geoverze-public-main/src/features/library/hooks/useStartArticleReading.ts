import { useEffect } from "react";

import { useLibraryStore } from "@/stores/libraryStore";

/** Record that the user opened an article — creates Continue Reading entry at 0%. */
export function useStartArticleReading(slug: string, enabled: boolean) {
  const startReading = useLibraryStore((s) => s.startReading);

  useEffect(() => {
    if (!enabled || !slug) return;
    startReading(slug);
  }, [enabled, slug, startReading]);
}
