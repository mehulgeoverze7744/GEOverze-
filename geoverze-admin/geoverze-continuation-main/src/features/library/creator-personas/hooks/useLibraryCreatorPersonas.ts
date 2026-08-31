import { useQuery } from "@tanstack/react-query";

import { fetchLibraryCreatorPersonas } from "../data/fetchLibraryCreatorPersonas";

export const libraryCreatorPersonasQueryKey = ["library-creator-personas"] as const;

export function useLibraryCreatorPersonas() {
  const query = useQuery({
    queryKey: libraryCreatorPersonasQueryKey,
    queryFn: fetchLibraryCreatorPersonas,
  });

  return {
    personas: query.data ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
