import { useQuery } from "@tanstack/react-query";

import { fetchLibraryResources } from "@/features/library/data/fetchLibraryResources";

export const libraryResourcesQueryKey = ["library-resources"] as const;

export function useLibraryResources() {
  const query = useQuery({
    queryKey: libraryResourcesQueryKey,
    queryFn: fetchLibraryResources,
  });

  return {
    resources: query.data ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
