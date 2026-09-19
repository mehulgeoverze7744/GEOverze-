import { useSyncExternalStore } from "react";

import { useLibraryStore } from "@/stores/libraryStore";

/** True after Zustand persist has rehydrated from scoped localStorage. */
export function useLibraryStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const persist = useLibraryStore.persist;
      if (!persist?.onFinishHydration) {
        queueMicrotask(onStoreChange);
        return () => undefined;
      }
      return persist.onFinishHydration(onStoreChange);
    },
    () => useLibraryStore.persist?.hasHydrated?.() ?? true,
    () => false,
  );
}
