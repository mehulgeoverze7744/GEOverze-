import { useQuery } from "@tanstack/react-query";

import { fetchLibraryCreatorPersonaByHandle } from "../data/fetchLibraryCreatorPersonas";
import { libraryCreatorPersonasQueryKey } from "./useLibraryCreatorPersonas";

export function libraryCreatorPersonaDetailQueryKey(handle: string) {
  return [...libraryCreatorPersonasQueryKey, handle] as const;
}

export function useLibraryCreatorPersonaDetail(handle: string) {
  const query = useQuery({
    queryKey: libraryCreatorPersonaDetailQueryKey(handle),
    queryFn: () => fetchLibraryCreatorPersonaByHandle(handle),
    enabled: Boolean(handle),
  });

  return {
    persona: query.data ?? null,
    loading: query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
