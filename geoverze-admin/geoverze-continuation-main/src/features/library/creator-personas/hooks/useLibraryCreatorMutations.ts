import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createLibraryCreatorPersona,
  deleteLibraryCreatorPersona,
  updateLibraryCreatorPersona,
} from "../data/creator-persona-mutations";
import { libraryCreatorPersonaDetailQueryKey } from "./useLibraryCreatorPersonaDetail";
import { libraryCreatorPersonasQueryKey } from "./useLibraryCreatorPersonas";
import type { LibraryCreatorPersona } from "../types";

export function useLibraryCreatorMutations() {
  const queryClient = useQueryClient();

  const invalidate = async (handle?: string) => {
    await queryClient.invalidateQueries({ queryKey: libraryCreatorPersonasQueryKey });
    if (handle) {
      await queryClient.invalidateQueries({
        queryKey: libraryCreatorPersonaDetailQueryKey(handle),
      });
    }
  };

  const create = useMutation({
    mutationFn: (persona: LibraryCreatorPersona) => createLibraryCreatorPersona(persona),
    onSuccess: async (created) => {
      await invalidate(created.handle);
      toast.success(`“${created.displayName}” created.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: (persona: LibraryCreatorPersona) => updateLibraryCreatorPersona(persona),
    onSuccess: async (_data, persona) => {
      await invalidate(persona.handle);
      toast.success("Creator saved.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (handle: string) => deleteLibraryCreatorPersona(handle),
    onSuccess: async () => {
      await invalidate();
      toast.success("Creator deleted.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { create, update, remove };
}
