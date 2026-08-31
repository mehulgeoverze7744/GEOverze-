import { useQuery } from "@tanstack/react-query";

import { fetchLibraryResourceById } from "@/features/library/data/fetchLibraryResources";

export const libraryResourceDetailQueryKey = (id: string) => ["library-resource", id] as const;

export function useLibraryResourceDetail(id: string) {
  const query = useQuery({
    queryKey: libraryResourceDetailQueryKey(id),
    queryFn: () => fetchLibraryResourceById(id),
    enabled: Boolean(id),
  });

  return {
    detail: query.data,
    resource: query.data?.resource,
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
